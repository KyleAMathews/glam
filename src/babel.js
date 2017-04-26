import * as babylon from 'babylon'
import touch from 'touch'
import fs from 'fs'

import hashArray from './hash'

function getName(str){
  let regex = /name\s*:\s*([A-Za-z0-9\-_]+)\s*/gm
  let match = regex.exec(str)
  if(match){
    return match[1]
  }
}

function parser(path) {
  let code = path.hub.file.code
  let strs = path.node.quasi.quasis.map(x => x.value.cooked)
  let hash = hashArray(strs)
  let name = getName(strs.join('xxx')) || 'css'  

  let stubs = path.node.quasi.expressions.map(x => code.substring(x.start, x.end))          
  let ctr = 0

  let src = strs.reduce((arr, str, i) => {
    arr.push(str)
    if(i !== stubs.length) {
      arr.push(`var(--${name}-${hash}-${i})`)
    }
    return arr
  }, []).join('')
  let parsed = src.trim()
  return { hash, parsed, stubs, name }
}

module.exports = function({ types: t }){
  return {
    visitor: {
      Program(path, state){
        let injected = false
        let inserted = {}
        let file = path.hub.file.opts.filename
        state.inject = function(){
          if(!injected){
            injected = true
            touch.sync(file + '.css')
            fs.writeFileSync(file + '.css',  '/* do not edit this file */\n')
            // if state.opts.require {}
            let impNode= babylon.parse(`import('./${require('path').basename(file) + '.css'}');`, {sourceType: 'module', plugins: ['*']}).program.body[0]
            path.node.body.unshift(impNode)            
            // else assume you're loading manually with importCSS()
          }          
        }
        state.insert = function(hash, css){
          if(!inserted[hash]){
            inserted[hash] = true 
            // todo - flush this in one go, and only if changed 
            fs.appendFileSync(file + '.css',  css + '\n')
          }
        }
      },
      TaggedTemplateExpression(path, state){
        let { tag } = path.node            
        let code = path.hub.file.code

        if(tag.name === 'css') {
          
          state.inject()
          
          let { hash, parsed, stubs, name } = parser(path)

          state.insert(hash, `.${name}-${hash} { ${parsed} }`)

          let cls = `'${name}-${hash}'`
          let vars = `[${stubs.join(', ')}]`
          let newSrc = stubs.length > 0 ? `css(${cls}, ${vars})` : `css(${cls})`

          path.replaceWith(babylon.parse(newSrc, {plugins: ['*']}).program.body[0].expression)
          
        }
      }
    }
  }
}
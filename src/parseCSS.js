import parse from 'styled-components/lib/vendor/postcss-safe-parser/parse'
// import { parse } from 'postcss'
import postcssNested from 'styled-components/lib/vendor/postcss-nested'
import stringify from 'styled-components/lib/vendor/postcss/stringify'
import autoprefix from 'styled-components/lib/utils/autoprefix'

export default function parser (css, options = {}) {
  // todo - handle errors
  const root = parse(css)
  if (options.nested !== false) postcssNested(root)
  autoprefix(root)

  return root.nodes.map((node, i) => {
    let str = ''
    stringify(node, x => {
      str += x
    })
    return str
  })
}

// todo -
// select from http://cssnext.io/



const css = require('../src').default
const { sheet, flush } = require('../src')
const fs = require('fs')
const path = require('path')

test('returns a class for a string', () => {
  expect(css`color:red`).toMatchSnapshot()
})

test('returns 2 classes for a dynamic string', () => {
  expect(css`color:red, font-weight:${'bold'}`).toMatchSnapshot()
})

test('receives a class and array of var values', () => {
  let css = function(a, b){
    return [a,b]
  }
  expect(css`color:red, font-weight:${'bold'}`).toMatchSnapshot()
})

test('injects dynamic values into a sheet', () => {
  flush()
  let cls = css`color: red; font-weight: ${'bold'}`
  expect(sheet.rules()).toMatchSnapshot()
})

test(`extracts css into a css file`, () => {
  let file = path.join(__dirname,'./index.test.js.css')
  expect(fs.existsSync(file)).toBe(true)
  expect(fs.readFileSync(file, 'utf8')).toMatchSnapshot()
})
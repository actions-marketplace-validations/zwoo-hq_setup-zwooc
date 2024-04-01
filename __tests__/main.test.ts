import { getDownloadUrl } from '../src/urls'
import * as os from 'os'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import { expect, test } from '@jest/globals'

test('gets download url to binary', async () => {
  const url = await getDownloadUrl('1.0.0')
  expect(
    url.startsWith(
      'https://github.com/zwoo-hq/zwooc/releases/download/v1.0.0/zwooc_'
    )
  ).toBeTruthy()
  expect(url.endsWith('.tar.gz')).toBeTruthy()
})

test('gets download url to latest version', async () => {
  const url = await getDownloadUrl('latest')
  expect(url).toMatch(
    'https://github.com/zwoo-hq/zwooc/releases/latest/download/'
  )
})

const execAction = (version: string): string => {
  process.env['RUNNER_TEMP'] = os.tmpdir()
  process.env['INPUT_VERSION'] = version

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'dist', 'index.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  const stdout = cp.execFileSync(np, [ip], options).toString()
  return stdout
}

test('loads specific version', () => {
  const VERSION = '1.0.0-alpha.1'
  const stdout = execAction(VERSION)

  console.log(stdout)
  expect.stringContaining(VERSION).asymmetricMatch(stdout)
})

test('runs with default', () => {
  const config = path.join(__dirname, '..', 'action.yml')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const action: any = yaml.load(fs.readFileSync(config, 'utf8'))
  const VERSION = action.inputs.version.default
  const stdout = execAction(VERSION)

  console.log(stdout)
  expect.stringContaining(VERSION).asymmetricMatch(stdout)
})

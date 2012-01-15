{spawn, exec} = require 'child_process'

task 'install', 'install `coffeedoctest` globally but from this source using npm', (options) ->
  exec('npm install -g .', (err, stdout, stderr) ->
   if err then console.error stderr
  )

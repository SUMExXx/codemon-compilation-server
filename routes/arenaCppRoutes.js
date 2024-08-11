const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec, spawn } = require('child_process');
require('dotenv').config()

const containerModule = require('../cpp_containers');

router.post('/test', (req, res) => {
  const { code,language, datatype, testCaseShow, testCaseHidden } = req.body;

  if (!code) {
    return res.status(400).send('No code provided');
  }

//   const tempDockerContainer = containerModule.findIdleCPPContainer()

  const tempCppPath = './codes/temp.cpp';
  const tempExecutablePath = './codes/temp';

  var results = {}
  var flag = testCaseShow.length

//   containerModule.markCPPContainerBusy(tempDockerContainer);
//   testCaseShow.map((testcase) => {
    fs.writeFileSync(`${tempCppPath}`, code)

    exec(`g++ ${tempCppPath} -o ${tempExecutablePath}`, async (error, stdout, stderr) => {
        if (error) {

            console.log(error)

            return res.status(200).json({
                state: 'error',
                output: `${stderr}`
            });
        }

        const runTestCase = (testcase) => {
            return new Promise((resolve, reject) => {

                var startTime;
                var endTime;

                const cppProcess = spawn(tempExecutablePath);

                cppProcess.stdin.write(`${testcase.input}`);
                startTime = Date.now();
                cppProcess.stdin.end();

                let output = '';
                let errorOutput = '';

                cppProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });

                cppProcess.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });

                cppProcess.on('close', (code) => {
                    endTime = Date.now();
                    if (code !== 0) {
                        // return res.status(500).json({
                        //     state: 'error',
                        //     output: errorOutput
                        // });
                        results[testcase.input] = {"input": testcase.input, "output": "error", "startTime": startTime.toString(), "endTime": endTime.toString()}
                        console.log(results[testcase.input])
                        resolve();
                        // flag = flag - 1;
                    } else{
                        // res.status(200).json({
                        //     state: 'fine',
                        //     output: output
                        // });
                        // console.log(output)
                        results[testcase.input] = {"input": testcase.input, "output": `${output.slice(0, -1)}`, "startTime": startTime.toString(), "endTime": endTime.toString()}
                        resolve();
                        // console.log(results)
                        // flag = flag - 1;
                    }
                });
            })
        }

        await Promise.all(testCaseShow.map(runTestCase));

        // if(flag == 0){
        //     console.log(results)

        //     res.status(200).json({
        //         "result": results
        //     })

        //     try {
        //         fs.unlinkSync(tempCppPath);
        //         fs.unlinkSync(tempExecutablePath);
        //     } catch (err) {
        //         console.error('Error deleting files:', err);
        //     }
        // }

        console.log(results)

        res.status(200).json({
            "result": results
        })

        try {
            fs.unlinkSync(tempCppPath);
            fs.unlinkSync(tempExecutablePath);
        } catch (err) {
            console.error('Error deleting files:', err);
        }

        // res.status(200).json({
        //     state: 'fine',
        //     output: `${stdout}`
        // });

        // exec(`docker exec ${tempDockerContainer} sh -c 'rm ${tempCppPath}'`, (error) =>{
        //     console.log(error);
        // })

        // exec(`docker exec ${tempDockerContainer} sh -c 'rm ${tempExecutablePath}'`, (error) =>{
        //     console.log(error);
        // })

        // try {
        //     fs.unlinkSync(tempCppPath);
        //     fs.unlinkSync(tempExecutablePath);
        // } catch (err) {
        //     console.error('Error deleting files:', err);
        // }

        // containerModule.markCPPContainerIdle(tempDockerContainer);
    })

});

module.exports = router;
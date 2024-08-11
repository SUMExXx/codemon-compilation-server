// const express = require('express');
// const router = express.Router();
// const bodyParser = require('body-parser');
// // const fs = require('fs');
// const { exec } = require('child_process');
// require('dotenv').config()

// const containerModule = require('../cpp_containers');

// router.post('/execute', (req, res) => {
//   const { code } = req.body;

//   if (!code) {
//     return res.status(400).send('No code provided');
//   }

//   const tempDockerContainer = containerModule.findIdleCPPContainer()

//   console.log(tempDockerContainer)

//   const tempCppPath = './codes/temp.cpp';
//   const tempExecutablePath = './codes/temp';

//   containerModule.markCPPContainerBusy(tempDockerContainer);

//   exec(`docker exec ${tempDockerContainer} sh -c 'printf "%s" "${code}" > ${tempCppPath}'`, (error) => {
//     console.log(error);
//   });

//   exec(`docker exec ${tempDockerContainer} sh -c 'g++ ${tempCppPath} -o ${tempExecutablePath} && ${tempExecutablePath}'`, (error, stdout, stderr) => {
//     if (error) {

//         exec(`docker exec ${tempDockerContainer} sh -c 'rm ${tempCppPath}'`, (error) =>{
//             console.log(error);
//         })

//         console.log(error)

//       return res.status(200).json({
//         state: 'error',
//         output: `${stderr}`
//       });
//     }

//     res.status(200).json({
//         state: 'fine',
//         output: `${stdout}`
//       });

//     exec(`docker exec ${tempDockerContainer} sh -c 'rm ${tempCppPath}'`, (error) =>{
//         console.log(error);
//     })

//     exec(`docker exec ${tempDockerContainer} sh -c 'rm ${tempExecutablePath}'`, (error) =>{
//         console.log(error);
//     })

//     // try {
//     //     fs.unlinkSync(tempCppPath);
//     //     fs.unlinkSync(tempExecutablePath);
//     // } catch (err) {
//     //     console.error('Error deleting files:', err);
//     // }

//     containerModule.markCPPContainerIdle(tempDockerContainer);
//   })

// });

// module.exports = router;

//

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config()

const containerModule = require('../cpp_containers');

router.post('/execute', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).send('No code provided');
  }

//   const tempDockerContainer = containerModule.findIdleCPPContainer()

  const tempCppPath = './codes/temp.cpp';
  const tempExecutablePath = './codes/temp';

//   containerModule.markCPPContainerBusy(tempDockerContainer);

  fs.writeFileSync(`${tempCppPath}`, code)

  exec(`g++ ${tempCppPath} -o ${tempExecutablePath} && ${tempExecutablePath}`, (error, stdout, stderr) => {
    if (error) {

        console.log(error)

      return res.status(200).json({
        state: 'error',
        output: `${stderr}`
      });
    }

    res.status(200).json({
        state: 'fine',
        output: `${stdout}`
      });

    // exec(`docker exec ${tempDockerContainer} sh -c 'rm ${tempCppPath}'`, (error) =>{
    //     console.log(error);
    // })

    // exec(`docker exec ${tempDockerContainer} sh -c 'rm ${tempExecutablePath}'`, (error) =>{
    //     console.log(error);
    // })

    try {
        fs.unlinkSync(tempCppPath);
        fs.unlinkSync(tempExecutablePath);
    } catch (err) {
        console.error('Error deleting files:', err);
    }

    // containerModule.markCPPContainerIdle(tempDockerContainer);
  })

});

module.exports = router;
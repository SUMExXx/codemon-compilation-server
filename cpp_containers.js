const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config()

const cppContainers = Array(parseInt(process.env.NUM_CONTAINERS)).fill({ name: '', idle: true });

module.exports.initializeCPPContainers = function() {
    cppContainers.forEach((container, index) => {
      const containerName = `gcc_instance_${index}`;
      cppContainers[index] = { name: containerName, idle: true };
      const command = `docker run -d --name ${containerName} gcc:latest tail -f /dev/null`;
  
      exec(command, (error, stdout, stderr) => {
        if (error) {
        //   console.error(`Error starting container ${containerName}: ${error}`);
            try{
                exec(`docker start ${containerName}`)
                console.log(`docker container ${containerName} started`)

                exec(`docker -i exec ${containerName} sh -c 'gcc --version'`, (error, stdout, stderr) =>{
                  if(error != null){
                    console.log(error)
                    if (error.code === 1) {
                      console.log(stdout);
                    } else {
                      console.log(error);
                    }
                  } else{
                    console.log(stdout)
                  }
                })

                exec(`docker exec ${containerName} sh -c 'mkdir codes'`, (error) =>{
                  if(error == null){
                    console.log(`codes folder created in ${containerName}`)
                  }else{
                    // console.log(error);
                  }
                })
            }catch(error){
                console.error(`Error starting container ${containerName}: ${error}`);
            }
          return;
        }else{
            console.log(`docker container ${containerName} created and started`)
            exec(`docker exec ${containerName} sh -c 'mkdir codes'`, (error) =>{
              if(error == null){
                console.log(`codes folder created in ${containerName}`)
              }else{
                console.log(error);
              }
            })
        }

        console.log(`Container ${containerName} started with ID: ${stdout.trim()}`);
      });
    });
  }

module.exports.findIdleCPPContainer = function() {
    return cppContainers.find(container => container.idle).name;
}
  
module.exports.markCPPContainerBusy = function(containerName) {
    const container = cppContainers.find(c => c.name === containerName);
    if (container) {
      container.idle = false;
    }
}
  
module.exports.markCPPContainerIdle = function(containerName) {
    const container = cppContainers.find(c => c.name === containerName);
    if (container) {
      container.idle = true;
    }
}
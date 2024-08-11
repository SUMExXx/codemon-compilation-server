const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config()

function getClassName(filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
  
      const classRegex = /\b(?:public\s+)?class\s+(\w+)/;
  
      const match = fileContent.match(classRegex);
  
      if (match && match[1]) {
        return match[1];
      }
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  
    return null;
  }

router.post('/execute', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).send('No code provided');
  }

  const tempJavaFolderPath = 'codes';
  var tempJavaFile = 'temp.java';
  var tempJavaClassname = '';
  var tempClassFile = 'temp.class';

  fs.writeFileSync(`./${tempJavaFolderPath}/${tempJavaFile}`, code);

  tempJavaClassname = getClassName(`./${tempJavaFolderPath}/${tempJavaFile}`)

  if(tempJavaClassname != null){

    fs.rename(`./${tempJavaFolderPath}/${tempJavaFile}`, `./${tempJavaFolderPath}/${tempJavaClassname}.java`, (err) => {
        if (err) {
          console.error('Error renaming file:', err);
          fs.unlinkSync(`./${tempJavaFolderPath}/temp.java`);
        }
      });
    
      tempJavaFile = `${tempJavaClassname}.java`
      tempClassFile = `${tempJavaClassname}`
    
      exec(`javac -d ${tempJavaFolderPath} ./${tempJavaFolderPath}/${tempJavaFile}`, (error, stdout, stderr) => {
        if (error) {

            fs.unlinkSync(`./${tempJavaFolderPath}/${tempJavaFile}`);

          return res.status(200).json({
            state: 'error',
            output: `${stderr}`
          });
        } else{

            exec(`java -cp ${tempJavaFolderPath} ${tempClassFile}`, (error, stdout, stderr) => {
                if (error) {
                    
                    try {
                        fs.unlinkSync(`./${tempJavaFolderPath}/${tempJavaFile}`);
                        fs.unlinkSync(`./${tempJavaFolderPath}/${tempClassFile}.class`);
                    } catch (err) {
                        console.error('Error deleting files:', err);
                    }

                  return res.status(200).json({
                    state: 'error',
                    output: `${stderr}`
                  });
                }
                
                try {
                    fs.unlinkSync(`./${tempJavaFolderPath}/${tempJavaFile}`);
                    fs.unlinkSync(`./${tempJavaFolderPath}/${tempClassFile}.class`);
                } catch (err) {
                    console.error('Error deleting files:', err);
                }

                return res.status(200).json({
                    state: 'fine',
                    output: `${stdout}`
                  });;
            
              })

        }

      })

  }else{
    res.status(200).json({
        state: 'error',
        output: `compilation error: NO PUBLIC CLASS FOUND`
      });;
  }

});

module.exports = router;
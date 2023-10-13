const { exec } = require("child_process");

exec("pm2 start /home/$USER/.fabdep/fabdep-2.0-v12.16.1/launcher.js --name fabdep", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
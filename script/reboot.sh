DELAY=2


# check command already exist or not
command_exists() {  
	command -v "$@" > /dev/null 2>&1 

}

echo
echo @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
echo @@@@@@@@@@@@@@@@ Starting Fabdep @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
echo @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
echo
cd /home/$USER/.fabdep/fabdep-2.0-v12.16.1
pm2 start launcher.js --name fabdep
echo
sleep $DELAY

if(command_exists fabdep) then
    echo
    pkill fabdep
   fabdep
    echo
else
    echo
    echo "Fabdep is not installed"
    exit 0
    echo
fi


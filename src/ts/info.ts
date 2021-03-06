import path from 'path';
import fs from 'fs';
import { downloadRelease } from '@terascope/fetch-github-release';
import { ipcRenderer } from 'electron';

const gamePath = process.argv.slice(process.platform === 'win32' ? -2 : -1)[0];

// Set the info window depending on the sent message
ipcRenderer.on('snap-connections-error', () => {
    document.title = 'Error';
    (document.getElementById('error-img') as HTMLImageElement).src = '../assets/error.svg';
    document.getElementById('text')!.innerHTML = 'Steam files interface is not connected.<br>Run <strong>snap connect eternalmodmanager:steam-files</strong>, then try again.';
});

ipcRenderer.on('tools-error', () => {
    document.title = 'Error';
    (document.getElementById('error-img') as HTMLImageElement).src = '../assets/error.svg';

    if (!fs.existsSync(gamePath) || !fs.lstatSync(gamePath).isDirectory) {
        // Game directory not found
        document.getElementById('text')!.innerHTML = 'Can\'t find the game directory.<br>Did you select/pass the correct directory?';
    }
    else if (!fs.existsSync(path.join(gamePath, 'DOOMEternalx64vk.exe'))) {
        // Game exe not found
        document.getElementById('text')!.innerHTML = 'Can\'t find DOOMEternalx64vk.exe.<br>Did you select/pass the correct directory?';
    }
    else if (process.platform === 'linux') {
        // Tools not found, prompt the user to download them
        document.getElementById('text')!.innerHTML = 'Couldn\'t find the modding tools, do you want to download them?';

        // Setup 'Yes' button
        const button = document.getElementById('ok-button')!;
        button.innerHTML = 'No';

        const yesButton = document.createElement('button');
        yesButton.innerHTML = 'Yes';
        yesButton.id = 'yes-button';

        yesButton.addEventListener('click', () => {
            // Download script from github
            document.title = 'Information';
            (document.getElementById('error-img') as HTMLImageElement).src = '../assets/info.svg';
            document.getElementById('text')!.innerHTML = 'Downloading modding tools...';

            const okButton = document.getElementById('ok-button')!;
            document.body.removeChild(okButton);
            document.body.removeChild(document.getElementById('yes-button')!);

            downloadRelease('leveste', 'EternalBasher', gamePath, () => { return true }, (asset) => { return asset.name === 'EternalModInjectorShell.zip' }, false, false)
            .then(() => {
                document.getElementById('text')!.innerHTML = 'Modding tools were downloaded succesfully.';
                ipcRenderer.send('tools-download-complete');
            }).catch(() => {
                document.title = 'Error';
                (document.getElementById('error-img') as HTMLImageElement).src = '../assets/error.svg';
                document.getElementById('text')!.innerHTML = 'Failed to download the modding tools.';
                okButton.innerHTML = 'OK';
                document.body.appendChild(okButton);
                document.body.removeChild(document.getElementById('yes-button')!);
            });
        });

        document.body.appendChild(yesButton);
    }
    else {
        // Tools not found
        document.getElementById('text')!.innerHTML = 'Can\'t find EternalModInjector.bat.<br>Make sure that the modding tools are installed.';
    }
});

ipcRenderer.on('settings-info', () => {
    document.title = 'Information';
    (document.getElementById('error-img') as HTMLImageElement).src = '../assets/info.svg';
    document.getElementById('text')!.innerHTML = 'Mod injector settings file not found.<br>The mod injector settings section will not be available until the mod injector is ran at least once.';
});

ipcRenderer.on('clipboard-info', () => {
    document.title = 'Information';
    (document.getElementById('error-img') as HTMLImageElement).src = '../assets/info.svg';
    document.getElementById('text')!.innerHTML = 'EternalMod.json template has been copied to your clipboard.';
});

ipcRenderer.on('restore-info', () => {
    document.title = 'Information';
    (document.getElementById('error-img') as HTMLImageElement).src = '../assets/info.svg';
    document.getElementById('text')!.innerHTML = 'This will restore your game to vanilla state by restoring the unmodded backed up game files.<br>' +
        'This process might take a while depending on the speed of your disk, so please be patient.<br>' +
        'Are you sure you want to continue?';

    // Setup 'Yes' button
    const button = document.getElementById('ok-button')!;
    button.innerHTML = 'No';

    const yesButton = document.createElement('button');
    yesButton.innerHTML = 'Yes';
    yesButton.id = 'yes-button';

    yesButton.addEventListener('click', () => {
        ipcRenderer.send('close-restore-window');
    });

    document.body.appendChild(yesButton);
});

ipcRenderer.on('restoring-info', () => {
    document.title = 'Information';
    (document.getElementById('error-img') as HTMLImageElement).src = '../assets/info.svg';
    document.getElementById('text')!.innerHTML = 'Restoring backups...';
    document.body.removeChild(document.getElementById('ok-button')!);
    document.body.removeChild(document.getElementById('yes-button')!);
});

ipcRenderer.on('restore-error', () => {
    document.title = 'Error';
    (document.getElementById('error-img') as HTMLImageElement).src = '../assets/error.svg';
    document.getElementById('text')!.innerHTML = 'Error while restoring backup file.';
});

ipcRenderer.on('restore-success-info', () => {
    document.title = 'Information';
    (document.getElementById('error-img') as HTMLImageElement).src = '../assets/info.svg';
    document.getElementById('text')!.innerHTML = 'Finished restoring backups.';
});

ipcRenderer.on('reset-info', () => {
    document.title = 'Information';
    (document.getElementById('error-img') as HTMLImageElement).src = '../assets/warning.svg';
    document.getElementById('text')!.innerHTML = 'This will delete your backed up game files.<br>' +
        'The next time mods are injected the backups will be re-created, so make sure to verify your game files after doing this.<br>' +
        'Are you sure you want to continue?';

    // Setup 'Yes' button
    const button = document.getElementById('ok-button')!;
    button.innerHTML = 'No';

    const yesButton = document.createElement('button');
    yesButton.innerHTML = 'Yes';
    yesButton.id = 'yes-button';

    yesButton.addEventListener('click', () => {
        ipcRenderer.send('close-reset-window');
    });

    document.body.appendChild(yesButton);
});

ipcRenderer.on('resetting-info', () => {
    document.title = 'Information';
    (document.getElementById('error-img') as HTMLImageElement).src = '../assets/info.svg';
    document.getElementById('text')!.innerHTML = 'Deleting backups...';
    document.body.removeChild(document.getElementById('ok-button')!);
    document.body.removeChild(document.getElementById('yes-button')!);
});

ipcRenderer.on('reset-error', () => {
    document.title = 'Error';
    (document.getElementById('error-img') as HTMLImageElement).src = '../assets/error.svg';
    document.getElementById('text')!.innerHTML = 'Error while deleting backup file.';
});

ipcRenderer.on('reset-success-info', () => {
    document.title = 'Information';
    (document.getElementById('error-img') as HTMLImageElement).src = '../assets/info.svg';
    document.getElementById('text')!.innerHTML = 'Finished deleting backups.';
});

ipcRenderer.on('settings-saved-info', () => {
    document.title = 'Information';
    (document.getElementById('error-img') as HTMLImageElement).src = '../assets/info.svg';
    document.getElementById('text')!.innerHTML = 'Successfully saved the new settings.';
});

// Use 'OK' button to close info window
document.getElementById('ok-button')!.addEventListener('click', () => {
    ipcRenderer.send('close-window');
});

// Ask main process for the info message
ipcRenderer.send('get-info');

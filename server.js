const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Serve static files (your HTML, CSS, JS)
app.use(express.static('public'));

// API to handle terminal commands
app.post('/api/command', (req, res) => {
    const { command } = req.body;
    const args = command.split(' ');
    const cmd = args[0];

    switch (cmd) {
        case 'ls':
            fs.readdir(process.cwd(), (err, files) => {
                if (err) {
                    return res.json({ output: `Error: ${err.message}` });
                }
                res.json({ output: files.join('\n') });
            });
            break;

        case 'cd':
            if (args.length < 2) {
                return res.json({ output: 'Usage: cd <directory>' });
            }
            try {
                process.chdir(args[1]);
                res.json({ output: `Changed directory to: ${process.cwd()}` });
            } catch (err) {
                res.json({ output: `Error: ${err.message}` });
            }
            break;

        case 'mkdir':
            if (args.length < 2) {
                return res.json({ output: 'Usage: mkdir <directory>' });
            }
            fs.mkdir(args[1], { recursive: true }, (err) => {
                if (err) {
                    return res.json({ output: `Error: ${err.message}` });
                }
                res.json({ output: `Directory created: ${args[1]}` });
            });
            break;

        case 'rm':
            if (args.length < 2) {
                return res.json({ output: 'Usage: rm <file_or_directory>' });
            }
            fs.rm(args[1], { recursive: true }, (err) => {
                if (err) {
                    return res.json({ output: `Error: ${err.message}` });
                }
                res.json({ output: `Deleted: ${args[1]}` });
            });
            break;

        case 'mv':
            if (args.length < 3) {
                return res.json({ output: 'Usage: mv <source> <destination>' });
            }
            fs.rename(args[1], args[2], (err) => {
                if (err) {
                    return res.json({ output: `Error: ${err.message}` });
                }
                res.json({ output: `Moved: ${args[1]} to ${args[2]}` });
            });
            break;

        case 'cat':
            if (args.length < 2) {
                return res.json({ output: 'Usage: cat <file>' });
            }
            fs.readFile(args[1], 'utf8', (err, data) => {
                if (err) {
                    return res.json({ output: `Error: ${err.message}` });
                }
                res.json({ output: data });
            });
            break;

        case 'strings':
            if (args.length < 2) {
                return res.json({ output: 'Usage: strings <file>' });
            }
            fs.readFile(args[1], 'utf8', (err, data) => {
                if (err) {
                    return res.json({ output: `Error: ${err.message}` });
                }
                const strings = data.match(/[^\x00-\x1F\x7F]+/g) || [];
                res.json({ output: strings.join('\n') });
            });
            break;

        case 'eog':
            if (args.length < 2) {
                return res.json({ output: 'Usage: eog <image_file>' });
            }
            fs.readFile(args[1], (err, data) => {
                if (err) {
                    return res.json({ output: `Error: ${err.message}` });
                }
                const base64 = data.toString('base64');
                res.json({ output: `<img src="data:image/png;base64,${base64}" alt="${args[1]}">` });
            });
            break;

        case 'clear':
            res.json({ output: 'clear' });
            break;

        default:
            res.json({ output: `Command not found: ${cmd}` });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
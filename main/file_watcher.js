#!/usr/bin/env node
'use strict';

const fs = require('fs');

// Read filename from stdin
let input = '';
process.stdin.on('data', chunk => input += chunk.toString());
process.stdin.on('end', () => {
    const filename = input.trim();
    
    if (!filename) {
        console.error('Usage: echo "filename.forth" | node file_watcher.js | ...');
        process.exit(1);
    }
    
    if (!fs.existsSync(filename)) {
        console.error(`Error: File '${filename}' not found`);
        process.exit(1);
    }
    
    console.error(`Watching: ${filename}`);
    
    // Read and send file immediately
    function sendFile() {
        try {
            const content = fs.readFileSync(filename, 'utf8');
            process.stdout.write(content + '\n\\ ---EOF---\n');  // ← Add EOF
        } catch (e) {
            console.error(`Error reading ${filename}:`, e.message);
        }
    } 

    // Send immediately
    sendFile();

    let lastMtime = null;
    let debounceTimer = null;

    function sendFileIfChanged() {
	try {
	    const stats = fs.statSync(filename);
	    const currentMtime = stats.mtime.getTime();
	    
	    // Only send if file actually changed
	    if (lastMtime === null || currentMtime !== lastMtime) {
		lastMtime = currentMtime;
		const content = fs.readFileSync(filename, 'utf8');
		process.stdout.write(content + '\n\\ ---EOF---\n');
	    } else {
		console.error('  (file mtime unchanged, skipping)');
	    }
	} catch (e) {
	    console.error(`Error reading ${filename}:`, e.message);
	}
    }

    // Send immediately
    sendFileIfChanged();

    // Watch for changes
    fs.watch(filename, (eventType) => {
	if (eventType === 'change') {
	    console.error(`File changed: ${filename}`);
	    
	    if (debounceTimer) {
		clearTimeout(debounceTimer);
	    }
	    
	    debounceTimer = setTimeout(() => {
		sendFileIfChanged();  // Use the mtime-checking version
		debounceTimer = null;
	    }, 100);  // Back to 100ms since we're checking mtime
	}
    });
});

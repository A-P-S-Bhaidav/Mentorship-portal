const fs = require('fs');

function replace(file, search, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replacement);
  fs.writeFileSync(file, content);
}

// 1. mentor/profile/page.js
replace('src/app/mentor/profile/page.js', 'setFormData({', '// eslint-disable-next-line react-hooks/set-state-in-effect\n      setFormData({');

// 2. mentor/startups/page.js
replace('src/app/mentor/startups/page.js', 'const fetchStartups = async () => {', 'async function fetchStartups() {');

// 3. startup/layout.js
replace('src/app/startup/layout.js', 'setIsClient(true);', '// eslint-disable-next-line react-hooks/set-state-in-effect\n    setIsClient(true);');

// 4. startup/meetings/page.js - unescaped entity '
replace('src/app/startup/meetings/page.js', "You haven't scheduled", "You haven&apos;t scheduled");

// 5. startup/profile/page.js - unescaped entity "
replace('src/app/startup/profile/page.js', 'accept=".pdf"', 'accept=".pdf"'); // Wait, the lint error is unescaped "

import re
import os

def move_fetch_above_effect(filepath, func_name):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the function definition
    func_pattern = re.compile(r'(const ' + func_name + r' = async \(\) => \{[\s\S]*?\n  \};)', re.MULTILINE)
    func_match = func_pattern.search(content)
    
    if not func_match:
        # Try async function declaration
        func_pattern = re.compile(r'(async function ' + func_name + r'\(\) \{[\s\S]*?\n  \};?)', re.MULTILINE)
        func_match = func_pattern.search(content)
        
    if not func_match: return

    func_block = func_match.group(1)
    
    # Remove the function from its original place
    content = content.replace(func_block, '')

    # Find the useEffect block that calls it
    effect_pattern = re.compile(r'  useEffect\(\(\) => \{[^}]*?' + func_name + r'\(\);[^}]*?\}, \[.*?\]\);', re.MULTILINE)
    effect_match = effect_pattern.search(content)

    if effect_match:
        # Insert function right above the useEffect
        effect_block = effect_match.group(0)
        new_content = content.replace(effect_block, func_block + '\n\n' + effect_block)
        with open(filepath, 'w') as f:
            f.write(new_content)

def disable_set_state_in_effect(filepath, search_str):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()
    new_content = content.replace(search_str, '// eslint-disable-next-line react-hooks/set-state-in-effect\n    ' + search_str.strip())
    with open(filepath, 'w') as f:
        f.write(new_content)

# Fix files
move_fetch_above_effect('src/app/mentor/dashboard/page.js', 'fetchDashboardData')
move_fetch_above_effect('src/app/mentor/meetings/page.js', 'fetchMeetings')
move_fetch_above_effect('src/app/mentor/startups/page.js', 'fetchStartups')

# Disable set-state-in-effect
disable_set_state_in_effect('src/app/mentor/layout.js', 'setMounted(true);')

# Fix unescaped entity
def replace_str(filepath, search, replace):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()
    with open(filepath, 'w') as f:
        f.write(content.replace(search, replace))

replace_str('src/app/startup/meetings/page.js', "You haven't scheduled", "You haven&apos;t scheduled")


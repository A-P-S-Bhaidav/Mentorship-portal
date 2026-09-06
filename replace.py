import os
import glob

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content.replace('calendly_link', 'cal_link').replace('Calendly', 'Cal.com').replace('calendlyLink', 'calLink')
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.js') or file.endswith('.css'):
            replace_in_file(os.path.join(root, file))

replace_in_file('supabase_setup.sql')

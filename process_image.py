from PIL import Image
import sys

def remove_white_bg(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Check if pixel is close to white (allow some tolerance for anti-aliasing)
            if item[0] > 220 and item[1] > 220 and item[2] > 220:
                newData.append((255, 255, 255, 0)) # Transparent
            else:
                newData.append(item) # Keep original

        img.putdata(newData)
        img.save(output_path, "PNG")
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

remove_white_bg("/Users/admin/.gemini/antigravity/brain/55900fec-4d9e-4406-9be6-468e444f3588/.user_uploaded/media__1788723330260.png", "/Users/admin/Documents/Mentorship portal/public/ecell_logo_transparent.png")

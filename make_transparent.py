from PIL import Image
import sys

def remove_color(input_path, output_path, target_color):
    try:
        img = Image.open(input_path).convert("RGBA")
        data = img.getdata()
        new_data = []
        
        # We will use a small tolerance since AI colors might not be perfectly pure
        for item in data:
            r, g, b, a = item
            if target_color == "green":
                # Look for very high green, very low red/blue
                if g > 200 and r < 50 and b < 50:
                    new_data.append((255, 255, 255, 0))
                else:
                    new_data.append(item)
            elif target_color == "magenta":
                # Look for high red and blue, low green
                if r > 200 and b > 200 and g < 50:
                    new_data.append((255, 255, 255, 0))
                else:
                    new_data.append(item)
        
        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Processed {input_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

remove_color("/Users/harshshah/.gemini/antigravity/brain/a38bb449-4b50-49e3-bc49-9a564472f663/sprite_energy_green_1776562095305.png", "public/assets/sprite_energy.png", "green")
remove_color("/Users/harshshah/.gemini/antigravity/brain/a38bb449-4b50-49e3-bc49-9a564472f663/sprite_transport_green_1776562104424.png", "public/assets/sprite_transport.png", "green")
remove_color("/Users/harshshah/.gemini/antigravity/brain/a38bb449-4b50-49e3-bc49-9a564472f663/sprite_waste_green_1776562115064.png", "public/assets/sprite_waste.png", "magenta")
remove_color("/Users/harshshah/.gemini/antigravity/brain/a38bb449-4b50-49e3-bc49-9a564472f663/sprite_shopping_green_1776562128617.png", "public/assets/sprite_shopping.png", "green")

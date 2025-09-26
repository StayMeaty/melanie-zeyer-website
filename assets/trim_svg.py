import xml.etree.ElementTree as ET
import re
from pathlib import Path

def parse_path_bounds(path_data):
    """Extract bounds from SVG path data"""
    # More comprehensive path parsing
    x_coords = []
    y_coords = []
    
    # Split path into commands
    commands = re.findall(r'[MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*', path_data)
    
    current_x = 0
    current_y = 0
    
    for cmd in commands:
        cmd_letter = cmd[0]
        coords_str = cmd[1:].strip()
        
        if coords_str:
            coords = re.findall(r'[-+]?\d*\.?\d+', coords_str)
            coords = [float(c) for c in coords]
        else:
            coords = []
        
        # Handle absolute commands
        if cmd_letter in 'M':  # Move to absolute
            if len(coords) >= 2:
                current_x = coords[0]
                current_y = coords[1]
                x_coords.append(current_x)
                y_coords.append(current_y)
                # Handle implicit line-to commands
                for i in range(2, len(coords), 2):
                    if i + 1 < len(coords):
                        current_x = coords[i]
                        current_y = coords[i + 1]
                        x_coords.append(current_x)
                        y_coords.append(current_y)
        elif cmd_letter in 'L':  # Line to absolute
            for i in range(0, len(coords), 2):
                if i + 1 < len(coords):
                    current_x = coords[i]
                    current_y = coords[i + 1]
                    x_coords.append(current_x)
                    y_coords.append(current_y)
        elif cmd_letter in 'H':  # Horizontal line absolute
            for coord in coords:
                current_x = coord
                x_coords.append(current_x)
                y_coords.append(current_y)
        elif cmd_letter in 'V':  # Vertical line absolute
            for coord in coords:
                current_y = coord
                x_coords.append(current_x)
                y_coords.append(current_y)
        elif cmd_letter in 'C':  # Cubic bezier absolute
            for i in range(0, len(coords), 6):
                if i + 5 < len(coords):
                    # Control points and end point
                    x_coords.extend([coords[i], coords[i + 2], coords[i + 4]])
                    y_coords.extend([coords[i + 1], coords[i + 3], coords[i + 5]])
                    current_x = coords[i + 4]
                    current_y = coords[i + 5]
        elif cmd_letter in 'S':  # Smooth cubic bezier absolute
            for i in range(0, len(coords), 4):
                if i + 3 < len(coords):
                    x_coords.extend([coords[i], coords[i + 2]])
                    y_coords.extend([coords[i + 1], coords[i + 3]])
                    current_x = coords[i + 2]
                    current_y = coords[i + 3]
        elif cmd_letter in 'Q':  # Quadratic bezier absolute
            for i in range(0, len(coords), 4):
                if i + 3 < len(coords):
                    x_coords.extend([coords[i], coords[i + 2]])
                    y_coords.extend([coords[i + 1], coords[i + 3]])
                    current_x = coords[i + 2]
                    current_y = coords[i + 3]
        elif cmd_letter in 'T':  # Smooth quadratic bezier absolute
            for i in range(0, len(coords), 2):
                if i + 1 < len(coords):
                    current_x = coords[i]
                    current_y = coords[i + 1]
                    x_coords.append(current_x)
                    y_coords.append(current_y)
        elif cmd_letter in 'A':  # Arc absolute
            for i in range(0, len(coords), 7):
                if i + 6 < len(coords):
                    current_x = coords[i + 5]
                    current_y = coords[i + 6]
                    x_coords.append(current_x)
                    y_coords.append(current_y)
        
        # Handle relative commands (lowercase)
        elif cmd_letter in 'm':  # Move to relative
            if len(coords) >= 2:
                current_x += coords[0]
                current_y += coords[1]
                x_coords.append(current_x)
                y_coords.append(current_y)
                for i in range(2, len(coords), 2):
                    if i + 1 < len(coords):
                        current_x += coords[i]
                        current_y += coords[i + 1]
                        x_coords.append(current_x)
                        y_coords.append(current_y)
        elif cmd_letter in 'l':  # Line to relative
            for i in range(0, len(coords), 2):
                if i + 1 < len(coords):
                    current_x += coords[i]
                    current_y += coords[i + 1]
                    x_coords.append(current_x)
                    y_coords.append(current_y)
        elif cmd_letter in 'h':  # Horizontal line relative
            for coord in coords:
                current_x += coord
                x_coords.append(current_x)
                y_coords.append(current_y)
        elif cmd_letter in 'v':  # Vertical line relative
            for coord in coords:
                current_y += coord
                x_coords.append(current_x)
                y_coords.append(current_y)
        elif cmd_letter in 'c':  # Cubic bezier relative
            for i in range(0, len(coords), 6):
                if i + 5 < len(coords):
                    x_coords.extend([current_x + coords[i], current_x + coords[i + 2], current_x + coords[i + 4]])
                    y_coords.extend([current_y + coords[i + 1], current_y + coords[i + 3], current_y + coords[i + 5]])
                    current_x += coords[i + 4]
                    current_y += coords[i + 5]
    
    if not x_coords or not y_coords:
        return None
    
    return {
        'min_x': min(x_coords),
        'max_x': max(x_coords),
        'min_y': min(y_coords),
        'max_y': max(y_coords)
    }

def get_element_bounds(element):
    """Get bounds of an SVG element"""
    bounds = None
    
    # Check for different shape types
    if element.tag.endswith('rect'):
        x = float(element.get('x', 0))
        y = float(element.get('y', 0))
        width = float(element.get('width', 0))
        height = float(element.get('height', 0))
        bounds = {
            'min_x': x,
            'max_x': x + width,
            'min_y': y,
            'max_y': y + height
        }
    elif element.tag.endswith('circle'):
        cx = float(element.get('cx', 0))
        cy = float(element.get('cy', 0))
        r = float(element.get('r', 0))
        bounds = {
            'min_x': cx - r,
            'max_x': cx + r,
            'min_y': cy - r,
            'max_y': cy + r
        }
    elif element.tag.endswith('ellipse'):
        cx = float(element.get('cx', 0))
        cy = float(element.get('cy', 0))
        rx = float(element.get('rx', 0))
        ry = float(element.get('ry', 0))
        bounds = {
            'min_x': cx - rx,
            'max_x': cx + rx,
            'min_y': cy - ry,
            'max_y': cy + ry
        }
    elif element.tag.endswith('path'):
        d = element.get('d', '')
        if d:
            bounds = parse_path_bounds(d)
    elif element.tag.endswith('line'):
        x1 = float(element.get('x1', 0))
        y1 = float(element.get('y1', 0))
        x2 = float(element.get('x2', 0))
        y2 = float(element.get('y2', 0))
        bounds = {
            'min_x': min(x1, x2),
            'max_x': max(x1, x2),
            'min_y': min(y1, y2),
            'max_y': max(y1, y2)
        }
    elif element.tag.endswith('polygon') or element.tag.endswith('polyline'):
        points = element.get('points', '')
        if points:
            coords = re.findall(r'[-+]?\d*\.?\d+', points)
            coords = [float(c) for c in coords]
            x_coords = coords[0::2]
            y_coords = coords[1::2]
            if x_coords and y_coords:
                bounds = {
                    'min_x': min(x_coords),
                    'max_x': max(x_coords),
                    'min_y': min(y_coords),
                    'max_y': max(y_coords)
                }
    
    # Check for transform attribute
    transform = element.get('transform')
    if transform and bounds:
        # Simple translation handling
        translate_match = re.search(r'translate\s*\(\s*([-+]?\d*\.?\d+)\s*,?\s*([-+]?\d*\.?\d+)?\s*\)', transform)
        if translate_match:
            tx = float(translate_match.group(1))
            ty = float(translate_match.group(2)) if translate_match.group(2) else 0
            bounds['min_x'] += tx
            bounds['max_x'] += tx
            bounds['min_y'] += ty
            bounds['max_y'] += ty
    
    return bounds

def calculate_content_bounds(root):
    """Calculate the bounding box of all content in the SVG"""
    min_x, min_y = float('inf'), float('inf')
    max_x, max_y = float('-inf'), float('-inf')
    has_content = False
    
    # Recursively check all elements
    for element in root.iter():
        # Skip metadata and non-visual elements
        if any(element.tag.endswith(tag) for tag in ['defs', 'metadata', 'title', 'desc', 'script', 'style']):
            continue
        
        bounds = get_element_bounds(element)
        if bounds:
            min_x = min(min_x, bounds['min_x'])
            max_x = max(max_x, bounds['max_x'])
            min_y = min(min_y, bounds['min_y'])
            max_y = max(max_y, bounds['max_y'])
            has_content = True
    
    if not has_content:
        return None
    
    # Add more padding (5px on each side) to ensure no content is cut
    padding = 5
    return {
        'x': min_x - padding,
        'y': min_y - padding,
        'width': max_x - min_x + 2 * padding,
        'height': max_y - min_y + 2 * padding
    }

def trim_svg(input_path, output_path):
    """Trim empty space from SVG file"""
    # Register namespace
    ET.register_namespace('', 'http://www.w3.org/2000/svg')
    
    # Parse the SVG file
    tree = ET.parse(input_path)
    root = tree.getroot()
    
    # Get current viewBox or dimensions
    viewbox = root.get('viewBox')
    if viewbox:
        current_dims = [float(x) for x in viewbox.split()]
        print(f"Current viewBox: {current_dims}")
    else:
        width = root.get('width', '100')
        height = root.get('height', '100')
        # Remove units if present
        width = re.match(r'[-+]?\d*\.?\d+', str(width)).group()
        height = re.match(r'[-+]?\d*\.?\d+', str(height)).group()
        current_dims = [0, 0, float(width), float(height)]
        print(f"Current dimensions: width={width}, height={height}")
    
    # Calculate content bounds
    bounds = calculate_content_bounds(root)
    
    if not bounds:
        print("Could not determine content bounds")
        return False
    
    print(f"Content bounds: x={bounds['x']:.2f}, y={bounds['y']:.2f}, width={bounds['width']:.2f}, height={bounds['height']:.2f}")
    
    # Update the SVG viewBox
    new_viewbox = f"{bounds['x']} {bounds['y']} {bounds['width']} {bounds['height']}"
    root.set('viewBox', new_viewbox)
    
    # Update width and height to maintain aspect ratio
    root.set('width', str(bounds['width']))
    root.set('height', str(bounds['height']))
    
    # Write the SVG manually to avoid namespace issues
    svg_content = ET.tostring(root, encoding='unicode')
    
    # Clean up any duplicate xmlns declarations
    svg_content = re.sub(r'xmlns:ns\d+="[^"]*"\s*', '', svg_content)
    svg_content = re.sub(r'ns\d+:', '', svg_content)
    
    # Ensure only one xmlns attribute
    if 'xmlns=' not in svg_content:
        svg_content = svg_content.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"', 1)
    
    # Write to file with XML declaration
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write(svg_content)
    
    print(f"\nTrimmed SVG saved to: {output_path}")
    print(f"Reduced from {current_dims[2]}x{current_dims[3]} to {bounds['width']:.2f}x{bounds['height']:.2f}")
    
    return True

if __name__ == "__main__":
    input_file = Path("logo.svg")
    output_file = Path("logo_trimmed.svg")
    
    if not input_file.exists():
        print(f"Error: {input_file} not found")
    else:
        success = trim_svg(input_file, output_file)
        if success:
            print("\nSVG trimmed successfully!")
            print(f"Original file: {input_file}")
            print(f"Trimmed file: {output_file}")
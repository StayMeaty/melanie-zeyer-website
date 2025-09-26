from lxml import etree
import re
from pathlib import Path

def parse_transform(transform_str):
    """Parse transform attribute and extract translation values"""
    if not transform_str:
        return 0, 0
    
    # Look for translate transformation
    translate_match = re.search(r'translate\s*\(\s*([-+]?\d*\.?\d+)\s*,?\s*([-+]?\d*\.?\d+)?\s*\)', transform_str)
    if translate_match:
        tx = float(translate_match.group(1))
        ty = float(translate_match.group(2)) if translate_match.group(2) else 0
        return tx, ty
    return 0, 0

def get_path_bounds(path_data):
    """Extract bounds from SVG path data with better parsing"""
    x_coords = []
    y_coords = []
    
    # Extract all numbers from the path
    numbers = re.findall(r'[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?', path_data)
    
    # Simple approach: treat pairs as x,y coordinates
    # This works for most cases but may not be perfect for all path commands
    for i in range(0, len(numbers) - 1, 2):
        try:
            x = float(numbers[i])
            y = float(numbers[i + 1])
            x_coords.append(x)
            y_coords.append(y)
        except (ValueError, IndexError):
            continue
    
    if not x_coords or not y_coords:
        return None
    
    return {
        'min_x': min(x_coords),
        'max_x': max(x_coords),
        'min_y': min(y_coords),
        'max_y': max(y_coords)
    }

def calculate_bounds_recursive(element, parent_transform=(0, 0)):
    """Recursively calculate bounds of an element and its children"""
    bounds_list = []
    
    # Get element's transform
    transform_str = element.get('transform', '')
    tx, ty = parse_transform(transform_str)
    total_tx = parent_transform[0] + tx
    total_ty = parent_transform[1] + ty
    
    # Process the element itself
    tag = element.tag.split('}')[-1] if '}' in element.tag else element.tag
    
    if tag == 'path':
        d = element.get('d', '')
        if d:
            path_bounds = get_path_bounds(d)
            if path_bounds:
                # Apply transform
                path_bounds['min_x'] += total_tx
                path_bounds['max_x'] += total_tx
                path_bounds['min_y'] += total_ty
                path_bounds['max_y'] += total_ty
                bounds_list.append(path_bounds)
    
    elif tag == 'rect':
        x = float(element.get('x', 0))
        y = float(element.get('y', 0))
        width = float(element.get('width', 0))
        height = float(element.get('height', 0))
        bounds_list.append({
            'min_x': x + total_tx,
            'max_x': x + width + total_tx,
            'min_y': y + total_ty,
            'max_y': y + height + total_ty
        })
    
    elif tag == 'circle':
        cx = float(element.get('cx', 0))
        cy = float(element.get('cy', 0))
        r = float(element.get('r', 0))
        bounds_list.append({
            'min_x': cx - r + total_tx,
            'max_x': cx + r + total_tx,
            'min_y': cy - r + total_ty,
            'max_y': cy + r + total_ty
        })
    
    elif tag == 'ellipse':
        cx = float(element.get('cx', 0))
        cy = float(element.get('cy', 0))
        rx = float(element.get('rx', 0))
        ry = float(element.get('ry', 0))
        bounds_list.append({
            'min_x': cx - rx + total_tx,
            'max_x': cx + rx + total_tx,
            'min_y': cy - ry + total_ty,
            'max_y': cy + ry + total_ty
        })
    
    elif tag == 'line':
        x1 = float(element.get('x1', 0))
        y1 = float(element.get('y1', 0))
        x2 = float(element.get('x2', 0))
        y2 = float(element.get('y2', 0))
        bounds_list.append({
            'min_x': min(x1, x2) + total_tx,
            'max_x': max(x1, x2) + total_tx,
            'min_y': min(y1, y2) + total_ty,
            'max_y': max(y1, y2) + total_ty
        })
    
    elif tag in ['polygon', 'polyline']:
        points = element.get('points', '')
        if points:
            coords = re.findall(r'[-+]?\d*\.?\d+', points)
            coords = [float(c) for c in coords]
            if len(coords) >= 2:
                x_coords = [coords[i] + total_tx for i in range(0, len(coords), 2)]
                y_coords = [coords[i] + total_ty for i in range(1, len(coords), 2)]
                if x_coords and y_coords:
                    bounds_list.append({
                        'min_x': min(x_coords),
                        'max_x': max(x_coords),
                        'min_y': min(y_coords),
                        'max_y': max(y_coords)
                    })
    
    # Process children
    for child in element:
        child_tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
        # Skip non-visual elements
        if child_tag not in ['defs', 'metadata', 'title', 'desc', 'script', 'style']:
            child_bounds = calculate_bounds_recursive(child, (total_tx, total_ty))
            bounds_list.extend(child_bounds)
    
    return bounds_list

def trim_svg(input_path, output_path):
    """Trim empty space from SVG file using lxml"""
    # Parse the SVG
    parser = etree.XMLParser(remove_blank_text=True, remove_comments=True)
    tree = etree.parse(input_path, parser)
    root = tree.getroot()
    
    # Get current viewBox
    viewbox = root.get('viewBox')
    if viewbox:
        current_dims = [float(x) for x in viewbox.split()]
        print(f"Current viewBox: {current_dims}")
    else:
        width = root.get('width', '100')
        height = root.get('height', '100')
        # Remove units
        width = re.match(r'[-+]?\d*\.?\d+', str(width))
        height = re.match(r'[-+]?\d*\.?\d+', str(height))
        width = float(width.group()) if width else 100
        height = float(height.group()) if height else 100
        current_dims = [0, 0, width, height]
        print(f"Current dimensions: {width}x{height}")
    
    # Calculate bounds
    all_bounds = calculate_bounds_recursive(root)
    
    if not all_bounds:
        print("No visual content found")
        return False
    
    # Merge all bounds
    min_x = min(b['min_x'] for b in all_bounds)
    max_x = max(b['max_x'] for b in all_bounds)
    min_y = min(b['min_y'] for b in all_bounds)
    max_y = max(b['max_y'] for b in all_bounds)
    
    # Add padding
    padding = 10  # Increased padding to be safe
    min_x -= padding
    min_y -= padding
    width = max_x - min_x + 2 * padding
    height = max_y - min_y + 2 * padding
    
    print(f"Content bounds: x={min_x:.2f}, y={min_y:.2f}, width={width:.2f}, height={height:.2f}")
    
    # Update viewBox and dimensions
    root.set('viewBox', f"{min_x} {min_y} {width} {height}")
    root.set('width', str(width))
    root.set('height', str(height))
    
    # Clean up namespace declarations
    # Remove all namespace attributes except the main one
    for key in list(root.attrib.keys()):
        if key.startswith('{') or (key.startswith('xmlns') and key != 'xmlns'):
            del root.attrib[key]
    
    # Ensure the main xmlns is set
    root.set('xmlns', 'http://www.w3.org/2000/svg')
    
    # Write the file
    tree.write(output_path, encoding='UTF-8', xml_declaration=True, pretty_print=True)
    
    print(f"\nTrimmed SVG saved to: {output_path}")
    print(f"Reduced from {current_dims[2]:.0f}x{current_dims[3]:.0f} to {width:.0f}x{height:.0f}")
    
    return True

if __name__ == "__main__":
    input_file = Path("logo.svg")
    output_file = Path("logo_trimmed.svg")
    
    if not input_file.exists():
        print(f"Error: {input_file} not found")
    else:
        try:
            success = trim_svg(input_file, output_file)
            if success:
                print("\nSVG trimmed successfully!")
        except ImportError:
            print("lxml library not found. Installing...")
            import subprocess
            subprocess.check_call(["pip", "install", "lxml"])
            print("Please run the script again.")
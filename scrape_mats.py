"""
Scrape the MATS Airtable public view using Playwright.
"""

from playwright.sync_api import sync_playwright
import json
import time


def scrape_mats_with_playwright():
    """
    Use Playwright to render the JS-heavy Airtable page.
    """
    
    url = "https://airtable.com/appgYHwg8mqw7IcaE/shrnETzJyPjfFFRb4"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        print("Loading page...")
        page.goto(url, wait_until="networkidle")
        
        # Wait for table to load
        print("Waiting for table to load...")
        try:
            page.wait_for_selector(".cellContainer", timeout=20000)
        except:
            print("Trying alternative selector...")
            page.wait_for_selector("[data-testid]", timeout=10000)
        
        # Give it extra time to fully render
        time.sleep(3)
        
        # Try to get column headers first
        headers = []
        header_elements = page.query_selector_all(".headerCell, [class*='header']")
        for h in header_elements:
            text = h.inner_text().strip()
            if text:
                headers.append(text)
        
        print(f"Found headers: {headers[:10]}...")
        
        # Get all rows
        rows = page.query_selector_all("[data-rowindex], .dataRow, tr")
        
        print(f"Found {len(rows)} rows")
        
        data = []
        for i, row in enumerate(rows[:100]):  # Limit to first 100 rows
            try:
                cells = row.query_selector_all(".cellContainer, .cell, td")
                row_data = []
                for cell in cells:
                    text = cell.inner_text().strip()
                    row_data.append(text)
                if row_data and any(row_data):  # Skip empty rows
                    data.append(row_data)
            except Exception as e:
                print(f"Error on row {i}: {e}")
                continue
        
        # Also try to get the page HTML for debugging
        html = page.content()
        with open("mats_debug.html", "w") as f:
            f.write(html)
        print("Saved debug HTML to mats_debug.html")
        
        browser.close()
        
        return {"headers": headers, "data": data}


if __name__ == "__main__":
    print("Scraping MATS Airtable...")
    
    try:
        result = scrape_mats_with_playwright()
        
        with open("mats_raw.json", "w") as f:
            json.dump(result, f, indent=2)
            
        print(f"Scraped {len(result['data'])} rows, saved to mats_raw.json")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


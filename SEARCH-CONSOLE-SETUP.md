# Search Console Setup Guide

## Google Search Console

### Step 1: Add Property
1. Go to: https://search.google.com/search-console
2. Click "Add Property"
3. Enter: `betsorted.co.za`

### Step 2: Verify Ownership
Choose **"HTML tag"** method:
- Google will give you a meta tag like:
  ```html
  <meta name="google-site-verification" content="your-code-here">
  ```
- Send to Milan → I'll add it to the site → Push to GitHub
- Wait 2-3 minutes for deployment
- Click "Verify" in Search Console

### Step 3: Submit Sitemap
Once verified:
1. Go to "Sitemaps" in left sidebar
2. Enter: `sitemap.xml`
3. Click "Submit"

Google will start indexing your pages within 24-48 hours.

### Step 4: Request Indexing for Key Pages
Speed up indexing for important pages:
1. Go to "URL Inspection" (top search bar)
2. Enter: `https://betsorted.co.za/`
3. Click "Request Indexing"
4. Wait 1-2 minutes
5. Repeat for other important URLs if needed

---

## Bing Webmaster Tools

### Easiest Method: Import from Google
1. Go to: https://www.bing.com/webmasters
2. Sign in with Microsoft account
3. Click "Import from Google Search Console"
4. Authorize the connection
5. Select `betsorted.co.za`
6. Done! (Bing copies everything from Google)

### Manual Method (if import doesn't work)
1. Go to: https://www.bing.com/webmasters
2. Click "Add Site"
3. Enter: `https://betsorted.co.za`
4. Choose verification method (HTML tag or DNS)
5. Send verification code to Milan
6. After verification, submit sitemap: `sitemap.xml`

---

## Current Status

### ✅ Already Done
- [x] robots.txt created and configured
- [x] sitemap.xml created with all pages
- [x] Google Analytics installed
- [x] Meta tags optimized for SEO

### ⏳ Waiting For
- [ ] Google Search Console verification code (from you)
- [ ] Bing verification (can do after Google is set up)

### 🎯 Next Steps After Verification
1. Monitor impressions/clicks in Search Console
2. Track which keywords drive traffic
3. Identify pages that need optimization
4. Request indexing for new content as you add it

---

## Expected Timeline

**Day 1 (Today):** Verification complete, sitemap submitted
**Day 2-3:** Google starts crawling
**Week 1:** First pages indexed
**Week 2:** Start seeing search impressions
**Week 3-4:** Organic traffic begins (small at first)
**Month 2:** Consistent organic traffic flow

---

## Troubleshooting

**"Couldn't verify ownership"**
- Wait 3-5 minutes after pushing code
- Clear your browser cache
- Check that verification tag is in the HTML source

**"Sitemap couldn't be read"**
- Make sure sitemap.xml is accessible at: https://betsorted.co.za/sitemap.xml
- Check for XML syntax errors

**"Pages not being indexed"**
- Be patient (takes 1-2 weeks)
- Request indexing manually via URL Inspection
- Check that robots.txt allows crawling

---

Ready to proceed? Get the Google verification code and paste it here! 🦅

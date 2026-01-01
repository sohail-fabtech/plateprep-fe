# Enterprise-Level Auth Image Recommendations for PlatePrep

## Overview
PlatePrep is a multi-tenant restaurant management SaaS platform (similar to Wix/Shopify for restaurants). The auth pages need professional, enterprise-level imagery that reflects:
- **Professional restaurant management**
- **Modern SaaS platform**
- **Customization & flexibility**
- **Team collaboration**
- **Enterprise-grade reliability**

---

## 🎨 Recommended Image Themes by Page

### 1. **Login Page** - "Welcome Back"
**Theme:** Professional chef/restaurant team, modern kitchen, or dashboard overview

**Options:**
- **Option A (Recommended):** Modern chef in professional kitchen with tablet/dashboard
  - Shows technology + culinary expertise
  - Represents the platform's core value
  - Professional, clean, modern

- **Option B:** Restaurant team collaborating around a tablet/dashboard
  - Shows collaboration and team management
  - Represents multi-user functionality
  - Enterprise feel

- **Option C:** Abstract dashboard/analytics visualization
  - Shows data-driven management
  - Modern SaaS aesthetic
  - Professional and clean

**Image Specifications:**
- Format: PNG or SVG (vector preferred)
- Dimensions: 800x600px minimum (will scale)
- Style: Modern, clean, professional illustration
- Colors: Should complement your brand colors (primary theme colors)

---

### 2. **Register/Signup Page** - "Get Started"
**Theme:** Growth, setup, customization, or restaurant opening

**Options:**
- **Option A (Recommended):** Restaurant owner/manager setting up their system
  - Shows ease of setup
  - Represents customization capability
  - Welcoming and approachable

- **Option B:** Multiple restaurant locations with customization options
  - Shows multi-location management
  - Represents scalability
  - Enterprise growth theme

- **Option C:** Abstract customization/configuration interface
  - Shows flexibility and customization
  - Modern SaaS onboarding feel
  - Professional setup process

**Image Specifications:**
- Format: PNG or SVG
- Dimensions: 800x600px minimum
- Style: Welcoming, growth-oriented, professional
- Colors: Should use lighter, more inviting tones

---

### 3. **Forgot Password Page** - "Reset Password"
**Theme:** Security, verification, or simple lock/security illustration

**Options:**
- **Option A (Recommended):** Simple, clean lock with restaurant/chef hat icon
  - Shows security + restaurant theme
  - Not too complex (focus on form)
  - Professional and trustworthy

- **Option B:** Abstract security/verification illustration
  - Clean and simple
  - Focus on security
  - Minimal distraction

- **Option C:** Subtle background pattern with security elements
  - Very minimal
  - Doesn't compete with form
  - Professional background

**Image Specifications:**
- Format: PNG or SVG
- Dimensions: 600x400px (smaller, less prominent)
- Style: Minimal, clean, security-focused
- Colors: Subtle, doesn't distract from form

---

### 4. **Verify Code Page** - "Verify Your Account"
**Theme:** Verification, confirmation, or checkmark with restaurant theme

**Options:**
- **Option A (Recommended):** Checkmark/verification with subtle restaurant elements
  - Shows verification process
  - Clean and simple
  - Professional confirmation

- **Option B:** Abstract verification/confirmation illustration
  - Modern and clean
  - Focus on verification
  - Professional appearance

**Image Specifications:**
- Format: PNG or SVG
- Dimensions: 600x400px
- Style: Clean, verification-focused
- Colors: Success/confirmation colors (green tones)

---

## 🖼️ Image Sources & Recommendations

### **Premium Illustration Libraries (Recommended)**

1. **unDraw** (https://undraw.co/)
   - Free, customizable SVG illustrations
   - Search: "restaurant", "chef", "dashboard", "team"
   - Can customize colors to match your brand
   - **Best for:** Login and Register pages

2. **Storyset** (https://storyset.com/)
   - Free animated illustrations
   - Restaurant and business themes
   - Professional quality
   - **Best for:** All auth pages

3. **Freepik** (https://www.freepik.com/)
   - Premium and free options
   - Search: "restaurant management", "chef dashboard", "SaaS login"
   - High-quality illustrations
   - **Best for:** Professional enterprise look

4. **Illustrations.co** (https://illlustrations.co/)
   - Free, modern illustrations
   - Clean, professional style
   - **Best for:** Modern SaaS aesthetic

5. **ManyPixels** (https://www.manypixels.co/gallery)
   - Free illustrations
   - Professional quality
   - Business and restaurant themes
   - **Best for:** Enterprise-level imagery

### **Custom Illustration Services**

1. **Fiverr/Upwork**
   - Hire illustrators for custom restaurant-themed illustrations
   - Budget: $50-$200 per illustration
   - **Best for:** Unique, branded illustrations

2. **Dribbble/Behance**
   - Find freelance illustrators
   - Professional portfolios
   - **Best for:** High-quality custom work

---

## 🎯 Specific Image Recommendations

### **Login Page - Recommended Image:**
**Search Terms:**
- "chef with tablet dashboard"
- "restaurant team collaboration"
- "modern kitchen management"
- "SaaS dashboard illustration"

**Recommended from unDraw:**
- Search: "Chef" or "Restaurant"
- Customize colors to match PlatePrep brand
- Use illustration showing technology + restaurant

### **Register Page - Recommended Image:**
**Search Terms:**
- "restaurant setup onboarding"
- "business growth illustration"
- "customization dashboard"
- "restaurant owner setup"

**Recommended from Storyset:**
- Search: "Business" or "Restaurant"
- Use growth/setup themed illustrations
- Welcoming and professional

### **Forgot Password - Recommended Image:**
**Search Terms:**
- "security lock restaurant"
- "password reset illustration"
- "verification security"

**Recommended:**
- Simple lock icon with restaurant theme
- Minimal, clean design
- Doesn't distract from form

---

## 🎨 Design Guidelines

### **Color Scheme:**
- Use your primary brand colors
- Ensure images complement (not compete with) form
- Maintain consistency across all auth pages
- Use theme-aware colors (light/dark mode support)

### **Style Consistency:**
- All images should have similar illustration style
- Consistent color palette
- Professional, modern aesthetic
- Restaurant/culinary theme throughout

### **Technical Requirements:**
- **Format:** SVG (preferred) or PNG
- **Dimensions:** 800x600px minimum (scales well)
- **File Size:** Optimized (< 200KB for PNG, < 50KB for SVG)
- **Responsive:** Should scale properly on all devices
- **Accessibility:** Include proper alt text

---

## 📁 File Structure Recommendation

```
/public/assets/illustrations/auth/
  ├── illustration_login.svg (or .png)
  ├── illustration_register.svg
  ├── illustration_forgot_password.svg
  ├── illustration_verify_code.svg
  └── illustration_new_password.svg
```

---

## 🚀 Implementation Example

### **Login Page:**
```tsx
<LoginLayout 
  title="Welcome back to PlatePrep"
  illustration="/assets/illustrations/auth/illustration_login.svg"
>
  {/* Form content */}
</LoginLayout>
```

### **Register Page:**
```tsx
<LoginLayout 
  title="Start managing your restaurant with PlatePrep"
  illustration="/assets/illustrations/auth/illustration_register.svg"
>
  {/* Form content */}
</LoginLayout>
```

---

## ✅ Quick Start Checklist

- [ ] Choose illustration style (consistent across all pages)
- [ ] Download/customize images from recommended sources
- [ ] Optimize images (compress, resize if needed)
- [ ] Place images in `/public/assets/illustrations/auth/`
- [ ] Update `LoginLayout` props with image paths
- [ ] Test on all screen sizes
- [ ] Verify colors match brand theme
- [ ] Test light/dark mode compatibility

---

## 💡 Pro Tips

1. **Consistency is Key:** Use the same illustration style across all auth pages
2. **Brand Colors:** Customize illustrations to match your PlatePrep brand colors
3. **Mobile First:** Ensure images look good on mobile (currently hidden, but good practice)
4. **Performance:** Use SVG when possible for better scalability and smaller file sizes
5. **Accessibility:** Always include descriptive alt text for images
6. **A/B Testing:** Consider testing different images to see which resonates with users

---

## 🎯 Final Recommendation

**For Enterprise-Level SaaS Platform:**

1. **Login:** Professional chef/restaurant team with technology (from unDraw or Storyset)
2. **Register:** Restaurant setup/onboarding illustration (welcoming, growth-oriented)
3. **Forgot Password:** Simple security lock illustration (minimal, clean)
4. **Verify Code:** Checkmark/verification illustration (clean, confirmation-focused)

**Style:** Modern, clean, professional illustrations that reflect restaurant management + technology

**Source:** Start with **unDraw** or **Storyset** (free, customizable, professional quality)

---

## 📞 Next Steps

1. Review recommended sources
2. Select illustration style that matches PlatePrep brand
3. Download/customize images
4. Implement in auth pages
5. Test and refine


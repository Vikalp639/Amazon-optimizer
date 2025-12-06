# Amazon Product Listing Optimizer

A lightweight web application built with **React**, **Node.js**, and **MySQL** that allows users to enter an Amazon ASIN, fetch product details, and generate AI-powered optimizations for titles, bullet points, descriptions, and keywords. Optimized results are stored and can be tracked over time.

---

## 1. **Project Setup & Demo**

### **Backend Setup**

```bash
cd backend
npm install
npm start
```

* Server runs at `http://localhost:5000/`.

### **Frontend Setup**

```bash
cd frontend
npm install
npm start
```

* Frontend runs at `http://localhost:3000/`.

### **Demo**

*<img width="1427" height="955" alt="Screenshot 2025-12-06 224324" src="https://github.com/user-attachments/assets/e9b8f396-aafb-4427-a824-ae03e47c6066" />*

---

## 2. **Problem Understanding**

The goal was to create a simple, user-friendly web app that:

* Allows users to input an Amazon ASIN.
* Fetches product details (title, bullet points, description) from Amazon.
* Uses AI (OpenAI/Gemini) to:

  * Generate a keyword-rich, optimized title.
  * Rewrite bullet points clearly and concisely.
  * Enhance the product description persuasively.
  * Suggest 3–5 new keywords.
* Displays original and optimized data side-by-side.
* Stores all optimizations in a MySQL database to track history and improvements.

### **Assumptions Made**

* ASINs are valid and publicly available on Amazon.
* AI API always returns valid optimization results.
* Basic UI is sufficient for comparison; no user authentication implemented.

---

## 3. **AI Prompts & Iterations**

### **Initial Prompt**

* "Optimize the following Amazon product title, bullet points, and description with keywords while keeping it readable and persuasive."

### **Issues Faced**

* AI sometimes returned incomplete or repetitive content.
* Keywords were not always relevant.
* Formatting inconsistent between bullets and description.

### **Refined Prompt**

* "Rewrite title, bullets, and description clearly and persuasively. Include 3–5 relevant keywords. Return structured JSON with keys: optimized_title, optimized_bullets, optimized_description, keywords."

* Ensures consistent, usable AI outputs for frontend display and database storage.

---

## 4. **Architecture & Code Structure**

### **Backend**

* **Framework:** Node.js + Express.js
* **Routes:** `/api/optimize` (POST), `/api/history/:asin` (GET)
* **Database:** MySQL (`optimizations` table)
* **AI Integration:** `aiService.js` handles API calls to OpenAI/Gemini.

### **Frontend**

* **Framework:** React.js
* **Components:**

  * `ASINInput` – Input field for ASIN
  * `OptimizationDisplay` – Side-by-side original vs optimized results
  * `History` – Displays past optimizations for an ASIN
* **State Management:** React `useState` + Context for shared state

### **Database Structure**

```sql
CREATE TABLE optimizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asin VARCHAR(50) NOT NULL,
    original_title TEXT,
    optimized_title TEXT,
    original_bullets TEXT,
    optimized_bullets TEXT,
    original_description TEXT,
    optimized_description TEXT,
    keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. **Screenshots / UI**

* **ASIN Input Screen:** Enter ASIN to optimize
* **Optimization Display:** Original vs Optimized side-by-side
* **History Screen:** View previous optimizations


<img width="950" height="618" alt="Screenshot 2025-12-06 225007" src="https://github.com/user-attachments/assets/bdd2aa2a-a2ea-4b9e-b80a-19e37fa86ce2" />


<img width="878" height="496" alt="Screenshot 2025-12-06 233754" src="https://github.com/user-attachments/assets/350ff94d-3e6a-4908-8021-b4d987c715bc" />
---
## 6. **Known Issues / Improvements**

### **Known Issues**

* Frequent Amazon scraping may be blocked; consider Amazon API or proxies.
* AI occasionally returns incomplete results.
* No user authentication or role management.
* UI is functional but basic.

### **Future Improvements**

* Add authentication and multi-user support.
* Batch ASIN optimization.
* Analytics to measure improvement of optimizations.
* Enhanced UI/UX with charts and progress tracking.
* Error handling and retry mechanisms for failed API requests.

---

## 7. **Bonus Work**

* Side-by-side comparison layout.
* Clean, minimal UI with React.
* MySQL database tracks history for each ASIN.
* Optimizations are timestamped for tracking improvements over time.

---

### **Thank You!**



---


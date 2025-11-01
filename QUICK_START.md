# React + Styled Components Quick Start

## Installation Commands

Run these commands in order:

### 1. Install Python Dependencies
```bash
pip install -r requirement.txt
```

### 2. Install React Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Start Backend Server
```bash
python backend.py
```

### 4. Start Frontend Server (in a new terminal)
```bash
cd frontend
npm start
```

## Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## Key Features
✅ Modern React with Hooks
✅ Styled Components for styling
✅ Responsive design
✅ File drag & drop
✅ Audio player with controls
✅ Progress indicators
✅ Error handling
✅ Accessible UI

## Styled Components Examples

### Custom Theme Usage
```jsx
const StyledButton = styled.button`
  background: ${({ theme }) => theme.colors.primary.gradient};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;
```

### Responsive Design
```jsx
const ResponsiveContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;
```

## Adding Figma Designs

1. Replace components in `frontend/src/components/`
2. Update theme in `frontend/src/styles/theme.js`
3. Keep the same prop interfaces for functionality
4. Test all interactive features

Enjoy building with React and styled-components! 🚀
# Microservice Architecture Visualizer - PRD

## Original Problem Statement
Build a Vite/React app that visualizes microservice architecture as SVG. Data model: Microservice (name, id, gateways[]) with Gateway (type: REST/KAFKA/SOAP, name, outbound[], inbound[]). Layout: microservice centered, gateways on inner circle, inbound/outbound on outer circles. Features: Material Design colors, circles for microservice/gateway, rounded rectangles for endpoints, bezier curves connecting elements, hover tooltips, click-to-front (z-index), SVG export. Structure as npm library exporting Graph component.

## Architecture
- **Frontend Only**: Vite/React application
- **Visualization**: SVG-based graph component
- **Library Structure**: npm package exporting Graph component

## Core Requirements (Static)
1. Microservice data model with gateways array
2. Gateway types: REST, KAFKA, SOAP
3. Each gateway has outbound[] and inbound[] endpoints
4. Circular layout with microservice centered
5. Material Design color scheme
6. Interactive features: hover tooltips, click selection
7. SVG export functionality

## User Personas
- Software Architects visualizing microservice dependencies
- DevOps engineers understanding service integrations
- Development teams documenting architecture

## What's Been Implemented (2026-02-09)
- ✅ Graph component with SVG visualization
- ✅ Microservice bubble centered in SVG
- ✅ 3 gateway types (REST, KAFKA, SOAP) with distinct colors
- ✅ Outbound endpoints (teal rounded rectangles)
- ✅ Inbound endpoints (indigo rounded rectangles)
- ✅ Bezier curves connecting all elements
- ✅ Hover tooltips showing element details
- ✅ Click-to-select with visual highlighting
- ✅ SVG export button with download
- ✅ Legend with all element types
- ✅ Material Design color palette
- ✅ Mock data with OrderService example

## File Structure
- `/app/frontend/src/lib/Graph.jsx` - Main visualization component
- `/app/frontend/src/lib/colors.js` - Material Design color palette
- `/app/frontend/src/lib/utils.js` - Utility functions (bezier, circle math)
- `/app/frontend/src/lib/Graph.css` - Component styles
- `/app/frontend/src/data/mockData.json` - Sample microservice data

## Prioritized Backlog

### P0 (Completed)
- All core features implemented and tested

### P1 (Future Enhancements)
- JSON data import from file upload
- Zoom and pan functionality
- Multiple microservices view
- Search/filter endpoints

### P2 (Nice to Have)
- Dark mode theme
- Animation on data changes
- Connection line highlighting on hover
- Custom color schemes

## Next Tasks
1. User can upload custom microservice JSON data
2. Add zoom/pan controls for large architectures
3. Publish as npm package

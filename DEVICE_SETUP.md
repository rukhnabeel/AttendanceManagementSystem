# Attendance Management System - Cross-Device Setup Guide

## 🚀 Running on All Devices

This attendance management system is optimized to work on:
- ✅ Desktop computers (Windows, Mac, Linux)
- ✅ Tablets (iPad, Android tablets)
- ✅ Mobile phones (iOS, Android)
- ✅ Any device with a modern web browser

## 📱 Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

This will start:
- **Backend Server**: `http://localhost:5000`
- **Frontend (Vite)**: `http://localhost:5173`
- **Network Access**: `http://YOUR_IP:5173`

### 2. Access from Different Devices

#### On the Same Computer
Open your browser and go to:
```
http://localhost:5173
```

#### On Mobile/Tablet (Same Network)
1. Find your computer's IP address:
   - **Windows**: Open Command Prompt and type `ipconfig`
   - **Mac/Linux**: Open Terminal and type `ifconfig` or `ip addr`
   - Look for IPv4 address (e.g., `192.168.1.8`)

2. On your mobile device, open the browser and go to:
   ```
   http://YOUR_IP_ADDRESS:5173
   ```
   Example: `http://192.168.1.8:5173`

3. **Important**: Make sure both devices are on the same WiFi network!

## 🔧 Mobile-Specific Features

### Camera Access
The system automatically detects mobile devices and optimizes camera settings:
- **Mobile**: Uses front-facing camera in portrait mode
- **Desktop**: Uses webcam in landscape mode
- **Error Handling**: Clear error messages if camera access is denied

### Responsive Design
- Touch-friendly buttons (minimum 44px touch targets)
- Optimized text sizes (prevents zoom on iOS)
- Safe area support for notched devices (iPhone X+)
- Adaptive layouts for all screen sizes

## 🌐 Browser Compatibility

### Recommended Browsers
- ✅ Chrome/Edge (v90+)
- ✅ Safari (v14+)
- ✅ Firefox (v88+)
- ✅ Samsung Internet (v14+)

### Required Permissions
The app needs:
- 📷 **Camera Access**: For attendance photo capture
- 📍 **Location Access** (optional): For location-based attendance

## 🔒 Security Notes

### HTTPS for Production
For camera access on mobile devices over network, you may need HTTPS:

1. **Option 1**: Use ngrok (easiest for testing)
   ```bash
   npx ngrok http 5173
   ```

2. **Option 2**: Generate local SSL certificate
   ```bash
   # Install mkcert
   npm install -g mkcert
   
   # Create certificate
   mkcert localhost YOUR_IP_ADDRESS
   ```

### Firewall Settings
If you can't access from mobile:
1. Check Windows Firewall settings
2. Allow Node.js through firewall
3. Ensure port 5173 and 5000 are not blocked

## 📊 Admin Credentials

- **Email**: `admin@tvh.com`
- **Password**: `tvh@2026`

## 🛠️ Troubleshooting

### Camera Not Working
1. **Check browser permissions**: Allow camera access when prompted
2. **HTTPS required**: Some browsers require HTTPS for camera on network
3. **Try different browser**: Test with Chrome/Safari
4. **Reload page**: Click the "Reload Page" button if camera fails

### Can't Access from Mobile
1. **Same network**: Ensure both devices on same WiFi
2. **Firewall**: Disable firewall temporarily to test
3. **IP address**: Double-check the IP address is correct
4. **Port**: Make sure `:5173` is included in the URL

### Port Already in Use
If you see "EADDRINUSE" error:
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Restart the server
npm run dev
```

## 📱 Installing as PWA (Progressive Web App)

On mobile browsers, you can "Add to Home Screen" for app-like experience:

### iOS (Safari)
1. Tap the Share button
2. Scroll down and tap "Add to Home Screen"
3. Name it and tap "Add"

### Android (Chrome)
1. Tap the menu (⋮)
2. Tap "Add to Home screen"
3. Name it and tap "Add"

## 🎯 Performance Tips

### For Best Mobile Experience
- Use WiFi instead of mobile data
- Close other apps to free up memory
- Enable hardware acceleration in browser
- Clear browser cache if experiencing issues

### For Best Desktop Experience
- Use Chrome or Edge for best performance
- Ensure good lighting for camera
- Use a modern webcam (720p or better)

## 🔄 Updates and Maintenance

### Updating the App
```bash
# Pull latest changes
git pull

# Install dependencies
npm install

# Restart server
npm run dev
```

### Database
- Currently using in-memory MongoDB (data resets on restart)
- For persistent data, configure MongoDB URI in `server/.env`

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for errors (F12)
3. Ensure all dependencies are installed
4. Try on a different device/browser

---

**Made with ❤️ for TVH**

# 🎯 Team Building Matcher

A fun, interactive website for team building activities with a Tinder-like matching animation! Perfect for company events and team bonding sessions.

## ✨ Features

- **Tinder-like Animation**: Beautiful card-based interface with smooth animations
- **Match Creation**: Pick two team members and create matches with fun animations
- **Confetti Effects**: Celebratory confetti animation when matches are made
- **Statistics Tracking**: Keep track of matches and remaining team members
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Keyboard Shortcuts**: Quick actions with spacebar, S, and R keys
- **Shuffle Functionality**: Randomize team member combinations
- **Match History**: View all created matches with timestamps

## 🚀 How to Use

1. **Open the website**: Simply open `index.html` in your web browser
2. **Create matches**: Click the "💕 Create Match!" button to pair two team members
3. **Shuffle cards**: Use the "🔄 Shuffle" button to randomize the current pair
4. **Reset game**: Use the "🔄 Reset" button to start over
5. **Keyboard shortcuts**:
   - **Spacebar**: Create a match
   - **S key**: Shuffle cards
   - **R key**: Reset game

## 🎨 Customization

### Adding Your Team Members

To add your actual 24 team members, edit the `teamMembers` array in `script.js`:

```javascript
const teamMembers = [
    { 
        id: 1, 
        name: "Your Team Member Name", 
        role: "Their Role", 
        image: "path/to/their/image.jpg" 
    },
    // ... add all 24 team members
];
```

### Image Requirements

- **Format**: JPG, PNG, or WebP
- **Size**: Recommended 300x400 pixels or similar aspect ratio
- **Location**: Place images in an `images/` folder in your project
- **Naming**: Use descriptive names like `john-doe.jpg`, `jane-smith.png`

### Example with Local Images

```javascript
const teamMembers = [
    { 
        id: 1, 
        name: "John Doe", 
        role: "Senior Developer", 
        image: "images/john-doe.jpg" 
    },
    { 
        id: 2, 
        name: "Jane Smith", 
        role: "UX Designer", 
        image: "images/jane-smith.jpg" 
    },
    // ... continue for all 24 members
];
```

### Customizing Match Messages

Edit the `messages` array in the `showMatchAnimation` function to add your own fun match messages:

```javascript
const messages = [
    "These two will make an amazing team!",
    "What a perfect match!",
    "Team goals achieved!",
    // Add your own messages here
];
```

## 🎯 Team Building Ideas

### Activity Variations

1. **Skill-Based Matching**: Match people with complementary skills
2. **Department Mixing**: Pair people from different departments
3. **Experience Levels**: Match senior and junior team members
4. **Project Teams**: Create project-specific teams
5. **Mentorship Pairs**: Create mentor-mentee relationships

### Game Modes

1. **Speed Matching**: Set a timer for quick decisions
2. **Blind Matching**: Hide roles and match based on names only
3. **Department Challenge**: Create teams with specific department requirements
4. **Skill Challenge**: Match people with specific skill combinations

## 🛠️ Technical Details

- **HTML5**: Semantic markup for accessibility
- **CSS3**: Modern styling with gradients and animations
- **Vanilla JavaScript**: No dependencies required
- **Responsive Design**: Mobile-first approach
- **Modern Animations**: CSS keyframes and transitions

## 📱 Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🎉 Tips for Team Building Events

1. **Set the Mood**: Use this during team lunches or happy hours
2. **Add Prizes**: Give small prizes for the most creative team names
3. **Follow Up**: Use the matches to create actual project teams
4. **Document**: Take screenshots of fun matches for company social media
5. **Customize**: Add company-specific roles and departments

## 🔧 Troubleshooting

### Images Not Loading
- Check file paths are correct
- Ensure images are in the right folder
- Verify image file names match exactly

### Animation Issues
- Try refreshing the page
- Check if JavaScript is enabled
- Clear browser cache

### Mobile Issues
- Ensure viewport meta tag is present
- Test on different screen sizes
- Check touch interactions

## 📄 License

This project is open source and available under the MIT License.

---

**Have fun building amazing teams! 🚀** 
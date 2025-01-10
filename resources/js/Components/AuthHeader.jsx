import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react'; // Import Link from Inertia
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const headerStyles = {
    backgroundColor: '#0038A7', // Background color of the header
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // Shadow effect for the header
    color: 'white', // Text color
    padding: '1rem', // Padding around the header
    display: 'flex', // Use flexbox to align items horizontally
    alignItems: 'center', // Center items vertically
    justifyContent: 'space-between', // Default spacing for larger screens
    position: 'relative', // Allow absolute positioning of the search bar
    fontWeight: 'bold',
};

const headingStyles = {
    fontSize: 'large', // Font size for the heading text
    margin: 0, // Remove default margin
    lineHeight: '1.5rem', // Adjust line height to align text with icon
    marginLeft: '0.5rem',
    marginTop: '0.2rem'
};

export default function Header() {
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 901);
    const [linkHover, setLinkHover] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 901);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header style={{ ...headerStyles, justifyContent: isSmallScreen ? 'center' : 'space-between' }}>
            {/* Link to Welcome Page */}
            <Link
                href="/"
                style={{
                    textDecoration: 'none',
                    color: linkHover ? '#001a4d' : 'white',
                    display: 'flex',
                    alignItems: 'center'
                }}
                onMouseEnter={() => setLinkHover(true)}
                onMouseLeave={() => setLinkHover(false)}
            >
                <FontAwesomeIcon icon={faHome} />
                <h1 style={headingStyles}>PWDirectory v3 - Ramp IT Up!</h1>
            </Link>
        </header>
    );
}

"use client"

import React, { useState, useEffect } from 'react';
import Navbar from "../navbar";

// Common passwords list
const commonPasswords = [
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234", 
  "111111", "1234567", "dragon", "123123", "baseball", "abc123", "football", 
  "monkey", "letmein", "shadow", "master", "666666", "qwertyuiop", "123321", 
  "mustang", "1234567890", "michael", "654321", "superman", "1qaz2wsx", "7777777", 
  "welcome", "admin", "princess", "sunshine", "iloveyou", "trustno1", "batman", 
  "starwars", "summer", "login", "freedom", "whatever", "qazwsx", "liverpool", 
  "computer", "asdfgh", "1234qwer", "matrix", "zxcvbn", "asdfghjkl", "jordan", 
  "test", "password123", "admin123", "letmein123", "welcome1", "adobe123",
  "azerty", "access", "soccer", "master", "thunder", "cookie", "iloveyou",
  "hello", "charlie", "donald", "ranger", "pokemon", "george", "harley",
  "summer", "corvette", "mercedes", "dallas", "brooks", "nascar", "elephant",
  "london", "coffee", "scooter", "merlin", "phoenix", "martin", "junior",
  "shadow", "ashley", "abc123", "bailey", "passw0rd", "whatever", "hunter",
  "killer", "hockey", "pepper", "jessica", "zaq1zaq1", "andrew", "thomas",
  "jasper", "hardcore", "secret", "123456", "123456789", "12345678", "password",
  "qwerty123", "qwerty1", "111111", "12345", "secret", "123123", "abc123",
  "password1", "letmein", "1q2w3e4r", "monkey", "qwerty", "123qwe", "1234", 
  "iloveyou", "123321", "123456", "password", "12345678", "qwerty", "123456789",
  "12345", "1234", "111111", "1234567", "dragon", "123123", "baseball", "abc123",
  "football", "monkey", "letmein", "696969", "shadow", "master", "666666", 
  "qwertyuiop", "123321", "mustang", "1234567890", "michael", "654321", "pussy", 
  "superman", "1qaz2wsx", "7777777", "fuckyou", "121212", "000000", "qazwsx", 
  "123qwe", "killer", "trustno1", "jordan", "jennifer", "zxcvbnm", "asdfgh", 
  "hunter", "buster", "soccer", "harley", "batman", "andrew", "tigger", "sunshine", 
  "iloveyou", "fuckme", "2000", "charlie", "robert", "thomas", "hockey", "ranger", 
  "daniel", "starwars", "klaster", "112233", "george", "asshole", "computer", 
  "michelle", "jessica", "pepper", "1111", "zxcvbn", "555555", "11111111", "131313", 
  "freedom", "777777", "pass", "fuck", "maggie", "159753", "aaaaaa", "ginger", 
  "princess", "joshua", "cheese", "amanda", "summer", "love", "ashley", "6969", 
  "nicole", "chelsea", "biteme", "matthew", "access", "yankees", "987654321", 
  "dallas", "austin", "thunder", "taylor", "matrix", "minecraft", "123456", "password", 
  "12345678", "qwerty", "123456789", "12345", "1234", "111111", "1234567", "dragon", 
  "123123", "baseball", "abc123", "football", "monkey", "letmein", "696969", "shadow", 
  "master", "666666", "qwertyuiop", "123321", "mustang", "1234567890", "michael", 
  "654321", "pussy", "superman", "1qaz2wsx", "7777777", "fuckyou", "121212", "000000", 
  "qazwsx", "123qwe", "killer", "trustno1", "jordan", "jennifer", "zxcvbnm", "asdfgh", 
  "hunter", "buster", "soccer", "harley", "batman", "andrew", "tigger", "sunshine", 
  "iloveyou", "fuckme", "2000", "charlie", "robert", "thomas", "hockey", "ranger", 
  "daniel", "starwars", "klaster", "112233", "george", "asshole", "computer", "michelle",
  "jessica", "pepper", "1111", "zxcvbn", "555555", "11111111", "131313", "freedom", 
  "777777", "pass", "fuck", "maggie", "159753", "aaaaaa", "ginger", "princess", 
  "joshua", "cheese", "amanda", "summer", "love", "ashley", "6969", "nicole", "chelsea", 
  "biteme", "matthew", "access", "yankees", "987654321", "dallas", "austin", "thunder", 
  "taylor", "matrix", "william", "corvette", "hello", "martin", "heather", "secret", 
  "fucker", "merlin", "diamond", "1234qwer", "gfhjkm", "hammer", "silver", "222222", 
  "88888888", "anthony", "justin", "test", "bailey", "q1w2e3r4t5", "patrick", "internet", 
  "scooter", "orange", "11111", "golfer", "cookie", "richard", "samantha", "bigdog", 
  "guitar", "jackson", "whatever", "mickey", "chicken", "sparky", "snoopy", "maverick", 
  "phoenix", "camaro", "sexy", "peanut", "morgan", "welcome", "falcon", "cowboy", 
  "ferrari", "samsung", "andrea", "smokey", "steelers", "joseph", "mercedes", "dakota", 
  "arsenal", "eagles", "melissa", "boomer", "booboo", "spider", "nascar", "monster", 
  "tigers", "yellow", "xxxxxx", "123123123", "gateway", "marina", "diablo", "bulldog", 
  "qwer1234", "compaq", "purple", "hardcore", "banana", "junior", "hannah", "123654", 
  "porsche", "lakers", "iceman", "money", "cowboys", "987654", "london", "tennis", 
  "999999", "ncc1701", "coffee", "scooby", "0000", "miller", "boston", "q1w2e3r4", 
  "fuckoff", "brandon", "yamaha", "chester", "mother", "forever", "johnny", "edward", 
  "333333", "oliver", "redsox", "player", "nikita", "knight", "fender", "barney", 
  "midnight", "please", "brandy", "chicago", "badboy", "iwantu", "slayer", "rangers", 
  "charles", "angel", "flower", "bigdaddy", "rabbit", "wizard", "bigdick", "jasper", 
  "enter", "rachel", "chris", "steven", "winner", "adidas", "victoria", "natasha", 
  "1q2w3e4r", "jasmine", "winter", "prince", "panties", "marine", "ghbdtn", "fishing", 
  "cocacola", "casper", "james", "232323", "raiders", "888888", "mickey1", "maggie123",
  "bruce", "kayla", "rocket", "bangbang", "willis", "taylor", "sexy1", "patricia", 
  "pacers", "viking", "jesse", "11111", "carlton", "friends", "steelers", "joey", 
  "bobby", "hannah123", "soccer1", "boston", "123321", "jjjjjj", "thunder1", "barbie",
  "jump", "cecilia", "mothers", "willy", "sparkle", "booboo1", "747474", "love123", 
  "frankie", "globetrotter", "darling", "silver1", "jets1", "carson", "milton", 
  "papa", "bamboo", "1972", "roger", "spider", "kitty", "archer", "123qwe", "brown", 
  "7777", "3333", "cucumber", "longhorn", "testing", "mickeymouse", "1qaz2wsx", 
  "lovelove", "bears", "knight1", "dragon1", "tiger1", "robot", "timothy", "steve", 
  "johnson", "paul", "fishing1", "jenny", "africa", "thunderbolts", "deborah", "karl", 
  "heather1", "sports", "1234000", "chevy", "wooden", "mack", "happy", "november", 
  "opensesame", "bear", "dancing", "security", "test123", "water", "glen", "police", 
  "megan", "chocolate", "brianna", "slacker", "password1", "drummer", "123abc", "beluga",
  "rainbow", "lighthouse", "1234abc", "sportsfan", "lincoln", "kylie", "summer1", "fuzzy"
];

// Create a Set for faster lookups
const commonPasswordSet = new Set(commonPasswords);

interface PasswordStrengthCheckerProps {
  password: string;
  className?: string;
}

const PasswordStrengthChecker: React.FC<PasswordStrengthCheckerProps> = ({
  password,
  className = '',
}) => {
  const [strength, setStrength] = useState({
    score: 0,
    label: 'Weak',
    color: 'bg-red-500',
  });
  const [isCommonPassword, setIsCommonPassword] = useState(false);

  // When password changes, calculate its strength
  useEffect(() => {
    // Check if password is in the common passwords list
    const isCommon = commonPasswordSet.has(password);
    setIsCommonPassword(isCommon);
    
    // Calculate strength with the common password information
    calculateStrength(password, isCommon);
  }, [password]);

  const calculateStrength = (pwd: string, isCommon = false) => {
    if (!pwd) {
      setStrength({ score: 0, label: 'Weak', color: 'bg-red-500' });
      return;
    }
    
    let score = 0;
    
    // Length check
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(pwd)) score += 1; // Has uppercase
    if (/[a-z]/.test(pwd)) score += 1; // Has lowercase
    if (/[0-9]/.test(pwd)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1; // Has special char
    
    // Sequential characters or numbers reduce strength
    if (/012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(pwd)) {
      score -= 1;
    }
    
    // Repeated characters reduce strength
    if (/(.)\1\1/.test(pwd)) {
      score -= 1;
    }
    
    // If it's a common password, drastically reduce the score
    if (isCommon) {
      score = 0;
    }
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(5, score));
    
    // Set the appropriate label and color based on score
    let label: string;
    let color: string;
    
    switch (score) {
      case 0:
      case 1:
        label = 'Weak';
        color = 'bg-red-500';
        break;
      case 2:
        label = 'Fair';
        color = 'bg-orange-500';
        break;
      case 3:
        label = 'Good';
        color = 'bg-yellow-500';
        break;
      case 4:
        label = 'Strong';
        color = 'bg-blue-500';
        break;
      case 5:
        label = 'Very Strong';
        color = 'bg-green-500';
        break;
      default:
        label = 'Weak';
        color = 'bg-red-500';
    }
    
    setStrength({ score, label, color });
  };

  const getProgressWidth = () => {
    return `${(strength.score / 5) * 100}%`;
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm">Password Strength:</span>
        <span className="text-sm font-medium">{strength.label}</span>
      </div>
      
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${strength.color} transition-all duration-300 ease-in-out`} 
          style={{ width: getProgressWidth() }}
        ></div>
      </div>
      
      {isCommonPassword && (
        <div className="mt-2 text-red-600 text-sm font-medium">
          This is a commonly used password! Please choose something more unique.
        </div>
      )}
      
      <ul className="mt-3 text-sm space-y-1">
        <li className={password.length >= 8 ? "text-green-600" : "text-gray-500"}>
          {password.length >= 8 ? "✓" : "○"} Minimum 8 characters
        </li>
        <li className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"}>
          {/[A-Z]/.test(password) ? "✓" : "○"} At least one uppercase letter
        </li>
        <li className={/[a-z]/.test(password) ? "text-green-600" : "text-gray-500"}>
          {/[a-z]/.test(password) ? "✓" : "○"} At least one lowercase letter
        </li>
        <li className={/[0-9]/.test(password) ? "text-green-600" : "text-gray-500"}>
          {/[0-9]/.test(password) ? "✓" : "○"} At least one number
        </li>
        <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : "text-gray-500"}>
          {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"} At least one special character
        </li>
        <li className={!isCommonPassword ? "text-green-600" : "text-red-600"}>
          {!isCommonPassword ? "✓" : "✗"} Not a commonly used password
        </li>
      </ul>
    </div>
  );
};

// Function to generate a strong password
const generateStrongPassword = (length: number) => {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  
  // Make sure we have at least one of each category
  let password = '';
  password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
  password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
  password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // All characters to choose from for the rest of the password
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  
  // Fill the rest of the password
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

// Enhanced Password Component with Generator
const PasswordInputWithStrengthChecker: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(12);
  
  // Function to handle password length input change
  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      // Ensure the value is between 5 and 20
      const clampedValue = Math.min(20, Math.max(5, value));
      setPasswordLength(clampedValue);
    }
  };
  
  // Function to generate a new password
  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword(passwordLength);
    setPassword(newPassword);
  };
  
  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <>
    <span className='absolute top-0 left-0 w-full'>
      <Navbar/>
    </span>
    
    <div className='min-h-screen flex justify-center place-items-center'>
      <div className="max-w-md w-1/3 mx-auto p-10 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">Check Password</h2>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-gray-900"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2 text-center">Generate Strong Password</h3>
          <div className="flex items-center justify-center space-x-2">
            <label htmlFor="password-length" className="text-sm text-gray-600">
              Length:
            </label>
            <input
              id="password-length"
              type="number"
              min="5"
              max="20"
              value={passwordLength}
              onChange={handleLengthChange}
              className="w-16 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={handleGeneratePassword}
              className="px-4 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Generate
            </button>
          </div>
        </div>
        
        <PasswordStrengthChecker password={password} />
      </div>
    </div>
    </>
  );
};

export default PasswordInputWithStrengthChecker;
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-cream min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h1 className="font-heading text-3xl font-bold text-primary mb-6">
            Privacy Policy
          </h1>
          
          <div className="prose prose-brown max-w-none">
            <p>
              This Privacy Policy describes how Marzan Taste ("we," "us," or "our") collects, uses, 
              and shares your personal information when you use our loyalty program service.
            </p>
            
            <h2>1. Information We Collect</h2>
            <p>
              We collect the following types of information:
            </p>
            <ul>
              <li>
                <strong>Account Information:</strong> When you create an account, we collect your 
                name, email address, and password.
              </li>
              <li>
                <strong>Transaction Information:</strong> We collect data about your purchases, 
                including transaction IDs, purchase amounts, and dates.
              </li>
              <li>
                <strong>Usage Information:</strong> We collect information about how you interact 
                with our service, including access times, pages viewed, and the routes by which 
                you access our service.
              </li>
            </ul>
            
            <h2>2. How We Use Your Information</h2>
            <p>
              We use your information for the following purposes:
            </p>
            <ul>
              <li>To provide and maintain our service</li>
              <li>To track your purchases and reward eligibility</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features when you choose to do so</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
            
            <h2>3. Data Retention</h2>
            <p>
              We will retain your personal information only for as long as is necessary for the 
              purposes set out in this Privacy Policy. We will retain and use your information to 
              the extent necessary to comply with our legal obligations, resolve disputes, and 
              enforce our policies.
            </p>
            
            <h2>4. Data Security</h2>
            <p>
              The security of your data is important to us, but remember that no method of 
              transmission over the Internet or method of electronic storage is 100% secure. 
              While we strive to use commercially acceptable means to protect your personal 
              information, we cannot guarantee its absolute security.
            </p>
            
            <h2>5. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access the personal information we have about you</li>
              <li>Correct inaccuracies in your personal information</li>
              <li>Delete your personal information</li>
              <li>Object to the processing of your personal information</li>
              <li>Request that we transfer your personal information to another organization</li>
            </ul>
            
            <h2>6. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page and updating the 
              "effective date" at the top of this Privacy Policy.
            </p>
            
            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at 
              privacy@marzantaste.com.
            </p>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/" className="btn-primary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
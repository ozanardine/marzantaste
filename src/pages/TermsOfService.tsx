import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-cream min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h1 className="font-heading text-3xl font-bold text-primary mb-6">
            Terms of Service
          </h1>
          
          <div className="prose prose-brown max-w-none">
            <p>
              These Terms of Service ("Terms") govern your use of the Marzan Taste Loyalty Program 
              (the "Program") operated by Marzan Taste ("we," "us," or "our").
            </p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>
              By using our loyalty program, registering for an account, or accessing any part of our 
              service, you agree to be bound by these Terms. If you do not agree to all the Terms, 
              you may not use the service.
            </p>
            
            <h2>2. Program Description</h2>
            <p>
              The Marzan Taste Loyalty Program allows customers to earn rewards by making qualifying 
              purchases at our stores. After every 10 qualifying purchases, members will earn a reward 
              which can be redeemed for specified items.
            </p>
            
            <h2>3. Account Registration</h2>
            <p>
              To participate in the Program, you must create an account. You agree to provide accurate, 
              current, and complete information during the registration process and to update such 
              information to keep it accurate, current, and complete.
            </p>
            
            <h2>4. Purchase Tracking</h2>
            <p>
              To earn credit for your purchases, you must submit your transaction details through our 
              website. Purchases are subject to verification and may be rejected if the information 
              cannot be verified or is found to be fraudulent.
            </p>
            
            <h2>5. Rewards</h2>
            <p>
              Rewards are earned after every 10 qualifying purchases. Rewards must be claimed within 
              30 days of issuance, after which they will expire. Rewards are non-transferable and have 
              no cash value.
            </p>
            
            <h2>6. Changes to the Program</h2>
            <p>
              We reserve the right to modify or terminate the Program at any time, for any reason, with 
              or without notice. Changes may affect the value of rewards already accumulated as well as 
              any rewards you may earn in the future.
            </p>
            
            <h2>7. Privacy</h2>
            <p>
              Our collection and use of your personal information is governed by our Privacy Policy, 
              which is incorporated into these Terms by reference.
            </p>
            
            <h2>8. Limitation of Liability</h2>
            <p>
              We shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages, including lost profits, arising out of or in any way connected with your use of 
              the Program.
            </p>
            
            <h2>9. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Brazil, 
              without regard to its conflict of law provisions.
            </p>
            
            <h2>10. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at info@marzantaste.com.
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

export default TermsOfService;
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { SMTPClient } from 'npm:emailjs@4.0.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Configure SMTP client with environment variables
const smtp = new SMTPClient({
  user: Deno.env.get('SMTP_USER') || 'noreply@marzantaste.com',
  password: Deno.env.get('SMTP_PASSWORD'),
  host: Deno.env.get('SMTP_HOST') || 'smtp.gmail.com',
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  tls: true,
  timeout: 10000, // 10 seconds timeout
});

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request
    if (!req.body) {
      throw new Error('Request body is required');
    }

    const { code, email } = await req.json();

    if (!code || !email) {
      throw new Error('Code and email are required');
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Create email message
    const message = {
      from: 'Marzan Taste <noreply@marzantaste.com>',
      to: email,
      subject: 'Seu Código de Fidelidade Marzan Taste',
      text: `
        Olá!

        Obrigado por sua compra na Marzan Taste! 
        
        Seu código de fidelidade é: ${code}

        Para resgatar seu código:
        1. Acesse nosso site: https://marzantaste.com
        2. Faça login em sua conta
        3. Clique em "Registrar Código"
        4. Digite o código acima
        
        Cada código registrado te aproxima de recompensas deliciosas!
        
        Atenciosamente,
        Equipe Marzan Taste
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #8B4513; 
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              background-color: #8B4513;
              color: #FFF8E7;
              padding: 20px;
              border-radius: 8px;
            }
            .code { 
              background: #FFF8E7; 
              padding: 20px; 
              text-align: center; 
              font-size: 32px; 
              font-weight: bold; 
              margin: 20px 0; 
              border-radius: 8px;
              border: 2px dashed #D2691E;
              color: #8B4513;
            }
            .steps { 
              background: #fff; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0;
              border: 1px solid #D2691E;
            }
            .step { 
              margin-bottom: 15px;
              padding-left: 30px;
              position: relative;
            }
            .step:before {
              content: "•";
              position: absolute;
              left: 10px;
              color: #D2691E;
              font-size: 20px;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              font-size: 14px; 
              color: #A0522D;
              border-top: 1px solid #D2691E;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Seu Código de Fidelidade</h1>
              <p>Obrigado por sua compra na Marzan Taste!</p>
            </div>
            
            <div class="code">
              ${code}
            </div>
            
            <div class="steps">
              <h2>Como Resgatar:</h2>
              <div class="step">Acesse nosso site: <a href="https://marzantaste.com" style="color: #D2691E;">marzantaste.com</a></div>
              <div class="step">Faça login em sua conta</div>
              <div class="step">Clique em "Registrar Código"</div>
              <div class="step">Digite o código acima</div>
            </div>
            
            <p style="text-align: center; color: #8B4513;">
              Cada código registrado te aproxima de recompensas deliciosas!
            </p>
            
            <div class="footer">
              <p>Atenciosamente,<br>Equipe Marzan Taste</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send email
    await smtp.send(message);

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );

  } catch (error) {
    // Log error for debugging
    console.error('Error sending email:', error);

    // Return error response
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send email',
        details: error.toString()
      }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
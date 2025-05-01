import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { SMTPClient } from 'npm:emailjs@4.0.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const smtp = new SMTPClient({
  user: Deno.env.get('SMTP_USER'),
  password: Deno.env.get('SMTP_PASSWORD'),
  host: Deno.env.get('SMTP_HOST'),
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  tls: true,
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, email } = await req.json();

    if (!code || !email) {
      throw new Error('Code and email are required');
    }

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
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #8B4513; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .code { background: #FFF8E7; padding: 15px; text-align: center; font-size: 24px; 
                   font-weight: bold; margin: 20px 0; border-radius: 8px; }
            .steps { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .step { margin-bottom: 10px; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #A0522D; }
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
              <div class="step">1. Acesse nosso site: <a href="https://marzantaste.com">marzantaste.com</a></div>
              <div class="step">2. Faça login em sua conta</div>
              <div class="step">3. Clique em "Registrar Código"</div>
              <div class="step">4. Digite o código acima</div>
            </div>
            
            <p>Cada código registrado te aproxima de recompensas deliciosas!</p>
            
            <div class="footer">
              <p>Atenciosamente,<br>Equipe Marzan Taste</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await smtp.send(message);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
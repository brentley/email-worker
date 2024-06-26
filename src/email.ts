import { extract as parseRawEmail } from 'letterparser';
import { Parser } from 'htmlparser2';

const DISC_MAX_LEN = 2000;

function extractTextFromHTML(html: string): string {
    let textContent = '';
    const parser = new Parser({
        ontext(text: string) {
            textContent += text;
        }
    });
    parser.write(html);
    parser.end();
    return textContent.trim();
}

export async function email(message: any, env: any, ctx?: any): Promise<void> {
    const url = env.WEBHOOK_URL;
    if (!url) throw new Error('Missing WEBHOOK_URL');

    try {
        const { from, to } = message;
        const subject = message.headers.get('subject') || '(no subject)';
        const date = new Date().toISOString(); // Current timestamp
        const rawEmail = (await new Response(message.raw).text()).replace(/utf-8/gi, 'utf-8');
        const email = parseRawEmail(rawEmail);

        let emailBody = email.text || '';
        if (!emailBody && email.html) {
            emailBody = extractTextFromHTML(email.html);
        }

        // Send the entire email body along with additional fields
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from,
                to,
                subject,
                date,
                content: emailBody || '(empty body)'
            }),
        });
        if (!response.ok) throw new Error('Failed to post message to Discord webhook.' + (await response.json()));

    } catch (error: any) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: error.stack }),
        });
        if (!response.ok) throw new Error('Failed to post error to Discord webhook.' + (await response.json()));
    }
}


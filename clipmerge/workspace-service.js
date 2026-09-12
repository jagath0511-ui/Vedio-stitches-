/**
 * ClipMerge - Google Workspace Service (Calendar, Gmail & Drive)
 * Integrates scheduling video releases/reviews on Google Calendar
 * and composing/sending video summaries and approval links via Gmail.
 * Supports both Google OAuth2 REST APIs and instant 1-Click Web Intents.
 */

export class WorkspaceService {
  constructor() {
    this.accessToken = localStorage.getItem('clipmerge_google_access_token') || null;
    this.connectedAccount = localStorage.getItem('clipmerge_google_account') || null;
  }

  setAccessToken(token, accountEmail = null) {
    this.accessToken = token || null;
    if (token) {
      localStorage.setItem('clipmerge_google_access_token', token);
      if (accountEmail) {
        this.connectedAccount = accountEmail;
        localStorage.setItem('clipmerge_google_account', accountEmail);
      }
    } else {
      localStorage.removeItem('clipmerge_google_access_token');
      localStorage.removeItem('clipmerge_google_account');
      this.connectedAccount = null;
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  isConnected() {
    return !!this.accessToken || !!this.connectedAccount;
  }

  getAccountInfo() {
    return {
      isConnected: this.isConnected(),
      email: this.connectedAccount || (this.accessToken ? 'Connected Google Account' : null),
      hasDirectApi: !!this.accessToken,
    };
  }

  /**
   * Schedule a video release or review event on Google Calendar.
   * Accepts { title, description, startTime, endTime, scheduledDate }
   */
  async scheduleEvent(options = {}) {
    return this.scheduleCalendarEvent(options);
  }

  async scheduleCalendarEvent({ title, description, scheduledDate, startTime, endTime, accessToken }) {
    const token = accessToken || this.accessToken;
    const start = new Date(startTime || scheduledDate || Date.now() + 3600 * 1000 * 24); // default tomorrow
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

    const eventTitle = `Video Release: ${title || 'ClipMerge Production'}`;
    const eventDescription = `${description || 'Merged video sequence and production assets.'}\n\nGenerated with ClipMerge Client-Side Suite.`;

    // Attempt direct Calendar API call if Google OAuth token is available
    if (token) {
      try {
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: eventTitle,
            description: eventDescription,
            start: { dateTime: start.toISOString() },
            end: { dateTime: end.toISOString() },
          }),
        });

        if (response.ok) {
          const created = await response.json();
          return {
            success: true,
            method: 'api',
            eventLink: created.htmlLink,
            message: 'Event scheduled directly on your Google Calendar!',
          };
        }
      } catch (err) {
        console.warn('Direct Calendar API failed, falling back to 1-click Web Intent:', err);
      }
    }

    // 1-Click Google Calendar Web Intent (Works universally without setup)
    const startStr = this.formatGoogleCalDate(start);
    const endStr = this.formatGoogleCalDate(end);
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&details=${encodeURIComponent(eventDescription)}&dates=${startStr}/${endStr}`;

    window.open(calUrl, '_blank', 'noopener,noreferrer');

    return {
      success: true,
      method: 'intent',
      eventLink: calUrl,
      message: 'Google Calendar opened in a new tab with your pre-filled video release details!',
    };
  }

  /**
   * Send or compose an email via Gmail with video details and chapters.
   * Accepts { to, toEmail, subject, body }
   */
  async sendOrDraftEmail(options = {}) {
    return this.sendGmailNotification(options);
  }

  async sendGmailNotification({ to, toEmail, subject, body, accessToken }) {
    const token = accessToken || this.accessToken;
    const recipient = to || toEmail || '';
    const emailSubject = subject || 'Your Merged Video is Ready (ClipMerge)';
    const emailBody = body || 'Here is your final stitched video from ClipMerge.';

    // Attempt direct Gmail API if OAuth token is available
    if (token) {
      try {
        const rawMessage = [
          `To: ${recipient}`,
          'Content-Type: text/plain; charset=utf-8',
          'MIME-Version: 1.0',
          `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(emailSubject)))}?=`,
          '',
          emailBody,
        ].join('\r\n');

        const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodedMessage }),
        });

        if (response.ok) {
          return {
            success: true,
            method: 'api',
            message: `Email sent successfully to ${recipient || 'recipient'} via Gmail API!`,
          };
        }
      } catch (err) {
        console.warn('Direct Gmail API send failed, falling back to Web Composer:', err);
      }
    }

    // 1-Click Gmail Web Composer Intent
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');

    return {
      success: true,
      method: 'intent',
      message: 'Gmail opened in a new tab with your pre-composed video summary and link!',
    };
  }

  /**
   * Format Date to Google Calendar template format (YYYYMMDDTHHmmSSZ)
   */
  formatGoogleCalDate(date) {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  }
}

function baseLayout(title, body) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#2e7d32;padding:20px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;">&#127934; ${title}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 32px;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:16px 32px;font-size:12px;color:#888;">
            Tennis App Notifications &mdash; Update your preferences in your profile settings.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function matchDetailsBlock(match) {
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:6px 0;color:#555;width:110px;"><strong>Date & Time</strong></td><td>${formatDateTime(match.start_time)} &ndash; ${formatDateTime(match.end_time)}</td></tr>
      <tr><td style="padding:6px 0;color:#555;"><strong>Location</strong></td><td>${match.court_address}</td></tr>
      ${match.min_ntrp_level ? `<tr><td style="padding:6px 0;color:#555;"><strong>Min NTRP</strong></td><td>${match.min_ntrp_level}</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:#555;"><strong>Max Players</strong></td><td>${match.max_players}</td></tr>
    </table>`;
}

function newMatchCreated(match) {
  const openSpots = match.max_players - (parseInt(match.registered_count, 10) || 1);
  const body = `
    <p style="font-size:16px;color:#333;">A new tennis match is available! <strong>${openSpots}</strong> spot${openSpots !== 1 ? 's' : ''} open.</p>
    ${matchDetailsBlock(match)}
    <p style="color:#555;">Organized by <strong>${match.organizer_name || 'a player'}</strong>.</p>`;
  return {
    subject: 'New tennis match available!',
    html: baseLayout('New Match Available', body),
  };
}

function matchCancelled(match) {
  const body = `
    <p style="font-size:16px;color:#c62828;">A match you were registered for has been cancelled.</p>
    ${matchDetailsBlock(match)}
    <p style="color:#555;">We're sorry for the inconvenience. Check the app for other upcoming matches!</p>`;
  return {
    subject: `Match cancelled — ${formatDateTime(match.start_time)}`,
    html: baseLayout('Match Cancelled', body),
  };
}

function waitlistPromotion(match, playerName) {
  const body = `
    <p style="font-size:16px;color:#2e7d32;"><strong>Great news, ${playerName}!</strong> A spot opened up and you've been promoted from the waitlist.</p>
    <p style="font-size:15px;color:#333;">You are now <strong>registered</strong> for this match:</p>
    ${matchDetailsBlock(match)}
    <p style="color:#555;">See you on the court!</p>`;
  return {
    subject: "You're in! Promoted from waitlist",
    html: baseLayout("You're In!", body),
  };
}

function matchReminder(match, registrations, hoursLabel) {
  const playerList = registrations
    .filter(r => r.registration_type === 'registered')
    .map(r => `<li>${r.name} (NTRP ${r.ntrp_level})</li>`)
    .join('');
  const body = `
    <p style="font-size:16px;color:#333;">Your match is coming up in <strong>${hoursLabel}</strong>!</p>
    ${matchDetailsBlock(match)}
    <p style="color:#555;"><strong>Players:</strong></p>
    <ul style="color:#333;">${playerList}</ul>`;
  return {
    subject: `Reminder: match in ${hoursLabel}`,
    html: baseLayout('Match Reminder', body),
  };
}

function unfilledMatch(match, openSpots) {
  const body = `
    <p style="font-size:16px;color:#333;">A match still needs <strong>${openSpots}</strong> more player${openSpots !== 1 ? 's' : ''}!</p>
    ${matchDetailsBlock(match)}
    <p style="color:#555;">Join now before it fills up!</p>`;
  return {
    subject: 'Match needs players!',
    html: baseLayout('Match Needs Players', body),
  };
}

function customEmail(senderName, messageText, matches) {
  const matchBlocks = matches.map(m => `
    <h3 style="margin:16px 0 0;color:#333;">Match at ${m.court_address}</h3>
    ${matchDetailsBlock(m)}`).join('');

  const body = `
    <p style="font-size:16px;color:#333;">You have a message from <strong>${senderName}</strong>:</p>
    <div style="background:#f8fafc;border-left:4px solid #2e7d32;padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0;">
      <p style="color:#333;white-space:pre-wrap;margin:0;">${messageText}</p>
    </div>
    ${matches.length > 0 ? `<h2 style="font-size:18px;color:#333;margin-top:24px;">Match Details</h2>${matchBlocks}` : ''}`;

  return {
    subject: `Message from ${senderName} — Tennis App`,
    html: baseLayout('Message from a Player', body),
  };
}

module.exports = { newMatchCreated, matchCancelled, waitlistPromotion, matchReminder, unfilledMatch, customEmail, baseLayout, matchDetailsBlock };

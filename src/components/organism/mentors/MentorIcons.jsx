import React from 'react'
import { Box } from '@mui/material'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import { GitHub, Language, LinkedIn } from '@mui/icons-material'

// Per-trainer social links. Each trainer carries their own URLs (from D1 /
// the fallback), and only the links that are present render — so no card ever
// shows another trainer's profile.
function MentorIcons({ trainer = {} }) {
  const links = [
    { url: trainer.linkedin_url, Icon: LinkedIn, cls: 'linkedin-icon', label: 'LinkedIn' },
    { url: trainer.github_url, Icon: GitHub, cls: 'github-icon', label: 'GitHub' },
    { url: trainer.instagram_url, Icon: InstagramIcon, cls: 'instagram-icon', label: 'Instagram' },
    { url: trainer.facebook_url, Icon: FacebookIcon, cls: 'facebook-icon', label: 'Facebook' },
    { url: trainer.website_url, Icon: Language, cls: 'website-icon', label: 'Website' },
  ].filter((l) => l.url)

  if (!links.length) return null

  return (
    <Box className="icons">
      {links.map(({ url, Icon, cls, label }, i) => (
        <a key={i} href={url} target="_blank" rel="noreferrer" aria-label={label}>
          <Icon className={cls} />
        </a>
      ))}
    </Box>
  )
}

export default MentorIcons

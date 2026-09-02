import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Chip, Stack } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import TypoGraphyComponent from '../../atoms/TypoGraphyComponent/TypoGraphyComponent';
import MentorIcons from './MentorIcons';
import CardGridItem from '../../molecules/Grid/CardGridItem';

function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Renders a trainer's credibility card. Every field except name+photo is
// optional and simply omitted when blank, so a sparse profile still looks
// intentional and a rich one shows full credentials.
function MentorsCard({ trainers = [] }) {
  return (
    <>
      {trainers.map((t, id) => {
        const skills = (t.expertise || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        return (
          <CardGridItem key={t.id ?? id} xs={12} sm={12} md={6} lg={4}>
            <Card className="trainer-card">
              <div className="trainer-photo">
                {t.photo_url ? (
                  <img src={t.photo_url} alt={t.name} />
                ) : (
                  <span className="trainer-initials">{initials(t.name)}</span>
                )}
              </div>
              <CardContent className="trainer-body">
                <TypoGraphyComponent
                  variant="h6"
                  text={t.name}
                  component="h3"
                  sx={{ fontWeight: "bold" }}
                />
                {t.title && <p className="trainer-title">{t.title}</p>}
                {t.experience && (
                  <p className="trainer-exp">
                    <WorkOutlineIcon fontSize="small" /> {t.experience}
                  </p>
                )}
                {skills.length > 0 && (
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    gap={0.5}
                    justifyContent="center"
                    className="trainer-skills"
                  >
                    {skills.map((s, i) => (
                      <Chip key={i} label={s} size="small" />
                    ))}
                  </Stack>
                )}
                {t.bio && <p className="trainer-bio">{t.bio}</p>}
                {t.certificate_url && (
                  <a
                    className="trainer-cert"
                    href={t.certificate_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <VerifiedIcon fontSize="small" /> View certificate
                  </a>
                )}
                <MentorIcons trainer={t} />
              </CardContent>
            </Card>
          </CardGridItem>
        );
      })}
    </>
  );
}

export default MentorsCard;

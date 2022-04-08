import React from 'react';
import './index.css';

const TRACK_HEIGHT = 30;
const ZOOM_FACTOR = 0.5;

export default function Record({ record, showGrid = true, scrollToCurrentTime, onClickOnTime, currentTime }) {

  const tracks = convertRecordToTracks(record, currentTime);
  const maxLength = findMaxTime(record, currentTime);

  const scrollView = React.useRef(null);

  React.useEffect(() => {
    if (scrollView.current) {
      const targetPosition = currentTime * ZOOM_FACTOR;
      if (scrollToCurrentTime) {
        scrollView.current.scroll({ left: targetPosition - 200 });
        console.log(targetPosition);
      }
    }
  }, [currentTime, scrollToCurrentTime]);

  return (
    <div
      className="record-container"
      ref={(ref) => scrollView.current = ref}
      style={{ height: (tracks.length + 4) * TRACK_HEIGHT, minHeight: 4 * TRACK_HEIGHT }}
      onClick={(e) => {
        if (e.currentTarget.classList.contains("record-container")) {
          const x = e.nativeEvent.clientX + scrollView.current.scrollLeft;
          const time = x / ZOOM_FACTOR;
          onClickOnTime(time);
        }
      }}
    >
      <div style={{ width: (maxLength * ZOOM_FACTOR) + 400 }}></div>
      {
        tracks.map((track, i) => (
          <div key={i} className="track" style={{ top: i * (TRACK_HEIGHT + 10), height: TRACK_HEIGHT }}>
            {
              track.map(({ start, duration, sound }, index) => (
                <div
                  key={index}
                  className="single-sound"
                  style={{ left: (start * ZOOM_FACTOR), width: (duration * ZOOM_FACTOR), ...getColorStylesForSound(sound) }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <div className="sound-text">
                    {sound.note} {sound.instrument}
                  </div>
                </div>
              ))
            }
          </div>
        ))
      }

      {
        showGrid && (
          range(0, maxLength + 100, 100).map((time) => (
            <div key={time} className="vertical-line" style={{ left: time * ZOOM_FACTOR }}>
              <div>{time % 500 === 0 ? String(time / 1000) + 's' : ''}</div>
            </div>
          ))
        )
      }

      {
        currentTime && (
          <div className="current-vertical-line" style={{ left: currentTime * ZOOM_FACTOR }}>
            <div>{String(currentTime / 1000) + 's'}</div>
          </div>
        )
      }

      <span style={{ visibility: 'hidden' }}>layout fix</span>
    </div>
  )
}

function getColorStylesForSound(sound) {
  let noteId = 0;
  for (const char of sound.note.split('')) {
    noteId += char.charCodeAt(0);
  }

  let instrumentId = 0;
  for (const char of sound.note.split('')) {
    instrumentId += char.charCodeAt(0);
  }

  const soundId = noteId + instrumentId * 1000;

  const h = soundId % 360;
  const s = 50;
  const l = 50;
  return { backgroundColor: `hsl(${h}, ${s}%, ${l}%)`, borderColor: `hsl(${h}, ${s}%, ${l - 20}%, 0.5)` };
}


function range(start, end, interval) {
  const result = [];
  for (let i = start; i < end; i += interval) {
    result.push(i);
  }
  return result;
}

function findMaxTime(records, currentTime = null) {
  return Math.max(currentTime, ...records.map((r) => r.offset + (r.duration ?? 0)));
}

function convertRecordToTracks(records = [], currentTime) {
  // Convert record to a format that's easier to work with
  const sounds = [];
  records = Array.from(records);
  while (records.length > 0) {
    const record = records.shift();
    if (record.action === "start") {
      // Find the end of this note
      const endIndex = records.findIndex((r) => r.action === "end" && JSON.stringify(r.sound) === JSON.stringify(record.sound));
      sounds.push({
        sound: record.sound,
        start: record.offset,
        duration: endIndex === -1 ?
          currentTime - record.offset : // The key is still down
          records[endIndex].offset - record.offset,
      });
      if (endIndex !== -1) records.splice(endIndex, 1);

    } else {
      throw new Error(`Unexpected action: ${record.action}`);
    }
  }

  // Sounds should be sorted by start time already, but just in case
  sounds.sort((a, b) => a.start - b.start);

  // Put them onto non-overlapping tracks
  const tracks = [];
  for (const sound of sounds) {
    // Find the first track that doesn't overlap
    const track = tracks.find((t) => t.at(-1).start + (t.at(-1).duration ?? 9999) <= sound.start);
    if (track) {
      track.push(sound);
    } else {
      tracks.push([sound]);
    }
  }

  return tracks;
}

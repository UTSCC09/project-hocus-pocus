import React from 'react';
import './index.css';

const TRACK_HEIGHT = 30;

export default function Record({
  record,
  showGrid = true,
  scrollToCurrentTime,
  onClickOnTime,
  currentTime,
  onSelectSound,
  selectedSoundIndex,
  zoomFactor,
}) {

  const tracks = convertRecordToTracks(record, currentTime);
  const maxLength = findMaxTime(record, currentTime);

  const scrollView = React.useRef(null);

  React.useEffect(() => {
    if (scrollView.current) {
      const targetPosition = currentTime * zoomFactor;
      if (scrollToCurrentTime) {
        scrollView.current.scroll({ left: targetPosition - 200 });
      }
    }
  }, [currentTime, scrollToCurrentTime, zoomFactor]);

  return (
    <div
      className="record-container"
      ref={(ref) => scrollView.current = ref}
      style={{ height: (tracks.length + 4) * TRACK_HEIGHT, minHeight: 4 * TRACK_HEIGHT }}
      onClick={(e) => {
        if (e.currentTarget.classList.contains("record-container")) {
          const x = e.nativeEvent.clientX + scrollView.current.scrollLeft - 30;
          const time = x / zoomFactor;
          onClickOnTime(time);
        }
      }}
    >
      <div style={{ width: (maxLength * zoomFactor) + 400 }}></div>
      {
        tracks.map((track, i) => (
          <div key={i} className="track" style={{ top: i * (TRACK_HEIGHT + 10), height: TRACK_HEIGHT }}>
            {
              track.map(({ start, duration, sound, originalIndex }, index) => {
                const isSelected = originalIndex === selectedSoundIndex;
                return (
                  <div
                    key={index}
                    className={`single-sound ${isSelected ? "selected" : ""}`}
                    style={{
                      left: (start * zoomFactor),
                      width: (duration * zoomFactor),
                      ...getColorStylesForSound(sound, isSelected),
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (isSelected) onSelectSound(null);
                      else onSelectSound(originalIndex);
                    }}
                  >
                    <div className="sound-text">
                      {sound.note}
                    </div>
                  </div>
                );
              })
            }
          </div>
        ))
      }

      {
        showGrid && (
          range(0, maxLength + 100, 100).map((time) => (
            <div key={time} className="vertical-line" style={{ left: time * zoomFactor }}>
              <div>{time % 500 === 0 ? String(time / 1000) + 's' : ''}</div>
            </div>
          ))
        )
      }

      {
        currentTime && (
          <div className="current-vertical-line" style={{ left: currentTime * zoomFactor }}>
            <div>{String(currentTime / 1000) + 's'}</div>
          </div>
        )
      }

      <span style={{ visibility: 'hidden' }}>layout fix</span>
    </div>
  )
}

function getColorStylesForSound(sound, isSelected) {
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
  return {
    backgroundColor: `hsl(${h}, ${s}%, ${l}%)`,
    borderColor: `hsl(${h}, ${s}%, ${l - 20}%, ${isSelected ? 1 : 0.5})`,
  };
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
  records = records.map((r, i) => ({ ...r, originalIndex: i }));

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
        originalIndex: record.originalIndex,
      });
      if (endIndex !== -1) records.splice(endIndex, 1);

    } else {
      // Ignore dangling ends
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

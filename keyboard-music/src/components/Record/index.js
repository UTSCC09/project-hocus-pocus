import './index.css';

const trackHeight = 30;

export default function Record({ record, showGrid = true, scrollToCurrentTime, onClick }) {
  const tracks = convertRecordToTracks(record);
  return (
    <div className="record-container" style={{ height: (tracks.length + 2) * trackHeight }}>
      {
        tracks.map((track, i) => (
          <div key={i} className="track" style={{ top: i * (trackHeight + 10), height: trackHeight }}>
            {
              track.map(({ start, duration, sound }, index) => (
                <div key={index} className="single-sound" style={{ left: start, width: duration, ...getColorStylesForSound(sound) }}>
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
          range(0, findMaxTime(record) + 100, 100).map((time) => (
            <div className="vertical-line" style={{ left: time }}><span>{time % 500 === 0 ? String(time / 1000) + 's' : ''}</span></div>
          ))
        )
      }

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

function findMaxTime(records) {
  return Math.max(...records.map((r) => r.offset + (r.duration ?? 0)));
}

function convertRecordToTracks(records = []) {
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
          null : // The key is still down
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

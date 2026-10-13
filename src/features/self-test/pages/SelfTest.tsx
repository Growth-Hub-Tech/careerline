// import { useState } from 'react';
// import type { Track } from '../data/questions';
// import type { Answers } from '../lib/scoring';
// import { TrackPicker } from '../components/TrackPicker';
// import { QuizStep } from '../components/QuizStep';
// import { Report } from '../components/Report';

// export const SelfTest = () => {
//   const [track, setTrack] = useState<Track | null>(null);
//   const [name, setName] = useState('');
//   const [index, setIndex] = useState(0);
//   const [answers, setAnswers] = useState<Answers>({});
//   const [startedAt, setStartedAt] = useState(0);
//   const [seconds, setSeconds] = useState<number | null>(null);

//   const start = (selected: Track, candidateName: string) => {
//     setTrack(selected);
//     setName(candidateName);
//     setIndex(0);
//     setAnswers({});
//     setSeconds(null);
//     setStartedAt(Date.now());
//   };

//   const reset = () => {
//     setTrack(null);
//     setIndex(0);
//     setAnswers({});
//     setSeconds(null);
//   };

//   const finish = () => setSeconds(Math.round((Date.now() - startedAt) / 1000));

//   const content = () => {
//     if (!track) return <TrackPicker onStart={start} />;

//     if (seconds !== null) {
//       return (
//         <Report track={track} answers={answers} name={name} seconds={seconds} onRetake={reset} />
//       );
//     }

//     return (
//       <QuizStep
//         key={track.questions[index].id}
//         track={track}
//         index={index}
//         selected={answers[track.questions[index].id]}
//         onSelect={(optionIndex) =>
//           setAnswers((prev) => ({ ...prev, [track.questions[index].id]: optionIndex }))
//         }
//         onBack={() => setIndex((i) => Math.max(0, i - 1))}
//         onNext={() => setIndex((i) => i + 1)}
//         onFinish={finish}
//         onExit={reset}
//       />
//     );
//   };

//   return <div className="w-full flex-1 bg-gray-50 print:bg-white">{content()}</div>;
// };

# Mudumalai 3D Audio Soundscape

Welcome to an immersive 3D audio experience of the Mudumalai National Park at sunrise. This application simulates a realistic forest environment where sounds move around you as you explore.

## 🌟 Features

- **3D Spatial Audio:** Sounds (Water, Wind, Elephant, Birds) change direction and volume based on your position and rotation.
- **Interactive Exploration:**
  - **Move:** Use **W, A, S, D** or **Arrow Keys** to walk around.
  - **Look:** Click and drag anywhere on the background to look around (360° view).
  - **Radar:** See where sounds are located relative to you. You can even **drag the blue (Water) and gray (Elephant) dots** on the radar to move them!
- **Real-Time Synthesis:** All sounds are generated instantly using the Web Audio API (no pre-recorded files), making the experience unique every time.
- **Customizable Environment:** Open the Settings (Gear Icon) to adjust volume and tone (frequency) for each sound element.

## 🛠️ How It Works (System Design)

The system takes your input (keyboard/mouse) and turns it into a 3D audio experience through the speakers.

### System Block Diagram

```mermaid
graph TD
    subgraph Inputs [User Inputs]
        KB[Keyboard (WASD)] -->|Move Position| Logic
        Mouse[Mouse Drag] -->|Rotate View| Logic
        UI[Settings Panel] -->|Adjust Audio| Logic
    end

    subgraph Logic [App Logic (React)]
        Tracker[User Tracker]
        State[State Manager]
    end

    subgraph AudioEngine [Web Audio API]
        Listener[Audio Listener (Your Ears)]
        
        subgraph Sources [Sound Sources]
            Water[Water Synthesizer]
            Wind[Wind Synthesizer]
            Elephant[Elephant Synthesizer]
            Birds[Bird Synthesizer]
        end
        
        Processor[3D Panner & Filter Nodes]
    end

    subgraph Output [Output Device]
        Speakers[Speakers / Headphones]
    end

    %% Connections
    Logic -->|Update Position/Rotation| Listener
    Logic -->|Update Volume/Tone| Processor

    Sources --> Processor
    Processor --> Listener
    Listener --> Speakers
```

### Detailed Flow

1.  **Input (You):**
    *   You press **WASD** to move or **Drag the Mouse** to look around.
    *   You adjust sliders in the **Settings Panel**.

2.  **Processing (The App):**
    *   The **User Tracker** calculates where you are in the virtual world (X, Y, Z coordinates and facing direction).
    *   The **State Manager** tracks where the sounds (Elephant, Water) are located.

3.  **Audio Engine (Web Audio API):**
    *   **Synthesizers:** The app generates raw audio signals (White Noise, Pink Noise) mathematically in real-time.
    *   **3D Panner Node:** This places the sound in 3D space. If the water is to your left, this node makes the sound come from the left speaker.
    *   **Audio Listener:** This represents "You" (or your ears/microphone) in the 3D space. It receives the processed audio based on your position.

4.  **Output (Speakers):**
    *   The final mix of all sounds is sent to your **Speakers or Headphones**, creating the illusion of a 3D environment.

## 🚀 Getting Started

1.  **Start:** Click the "Start Experience" button to enable audio.
2.  **Explore:** Use **W, A, S, D** to walk towards sounds.
3.  **Look:** **Click and Drag** the background to look up, down, left, or right.
4.  **Interact:** Open the **Radar** (top right) and drag the **Blue Dot** (Water) or **Gray Dot** (Elephant) to move the sounds around you!

## 💻 Tech Stack

*   **React:** For the user interface and state management.
*   **Vite:** For fast development and building.
*   **Web Audio API:** For advanced, real-time audio synthesis and spatialization.

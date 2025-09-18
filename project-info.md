# TravelTongue Project Information

## 1. Business Objective & Target Users

### Business Objective

Enable international travelers to navigate essential Japanese interactions with cultural appropriateness and confidence through instant, context-aware speech assistance. Reduce communication anxiety in high-stakes scenarios (dining, emergencies, transportation) while maintaining lightweight performance.

### Target User Persona

**"Tourist Takashi"**

- International traveler (25-55 years) visiting Japan with limited Japanese proficiency
- Needs immediate assistance for specific interactions (ordering food, asking directions)
- Values cultural appropriateness over literal translation
- Prefers tap-based interactions over typing during real-world scenarios
- Concerned about social embarrassment in unfamiliar cultural contexts
- Willing to provide minimal profile data (allergies, gender) for contextual relevance

## 2. Core Value Proposition

> "Instant polite speech for real-world Japanese interactions - no language skills required"

## 3. MVP Feature Prioritization

### Must-Have (Critical Path)

| Priority | Feature                          | Business Value                         | Dependencies                                |
| -------- | -------------------------------- | -------------------------------------- | ------------------------------------------- |
| P0       | Authentication & Onboarding      | Foundation for personalized experience | NextAuth + Drizzle adapter, email whitelist |
| P0       | Static Soundpad UI with Playback | Immediate user value demonstration     | Browser TTS API, mobile-first UI components |
| P1       | Soundpad Generator (LLM)         | Core differentiator vs competitors     | Gemini API integration, prompt engineering  |
| P1       | Live Conversation UI             | Primary user engagement driver         | STT integration, response choice rendering  |
| P2       | Profile Management               | Contextual relevance for LLM outputs   | User preference schema, data persistence    |

### Should-Have

- Conversation History & Export
- TTS Voice Preferences
- Scenario Caching (cost control)

### Could-Have (Post-MVP)

- Offline phrase caching
- Cultural etiquette tips
- Multi-language support

### Won't-Have (Scope Boundaries)

- Full conversation translation
- Voice-to-voice real-time translation
- User-generated phrase sharing
- Social features

## 4. User Stories & Acceptance Criteria

### P0: Authentication & Onboarding

**As a** first-time traveler to Japan,  
**I want** a frictionless sign-in with Google  
**So that** I can start using the app immediately without registration overhead

_Acceptance Criteria:_

- [ ] Google OAuth flow completes in ≤ 3 seconds
- [ ] Email whitelist blocks unauthorized users with clear message
- [ ] Onboarding collects only essential profile data (max 3 screens)
- [ ] Profile data includes: preferred language, gender, food allergies
- [ ] All collected data directly informs LLM context generation

### P0: Static Soundpad UI

**As a** tourist ordering food in Japan,  
**I want** to tap pre-made polite phrases grouped by scenario  
**So that** I can communicate appropriately without language skills

_Acceptance Criteria:_

- [ ] 20-24 phrases per scenario (Greetings, Dining, Directions)
- [ ] Teal-themed mobile UI with minimum 44px touch targets
- [ ] Browser TTS playback with ≤ 200ms latency
- [ ] Phrase grouping matches real-world interaction contexts
- [ ] Long-press shows original Japanese text for learning

### P1: Soundpad Generator

**As a** traveler in a unique scenario (e.g., "sushi with friends"),  
**I want** to generate custom phrase sets via text input  
**So that** I get situationally appropriate language assistance

_Acceptance Criteria:_

- [ ] Input field accepts natural language scenario descriptions
- [ ] Returns exactly 20-24 JSON-formatted phrases (strict schema)
- [ ] Generated phrases prioritize polite register (です/ます form)
- [ ] Caches results for identical scenario+profile combinations
- [ ] Fallback to static pads when LLM unavailable

### P1: Live Conversation Mode

**As a** traveler in real-time interaction,  
**I want** to record speech, see transcript, and select from 6 reply options  
**So that** I can respond appropriately without language skills

_Acceptance Criteria:_

- [ ] Hold-to-record UI with visual feedback
- [ ] Transcript displays within 1.5 seconds of release
- [ ] Exactly 6 reply choices covering: confirmation, decline, repeat request, gratitude, contextual alternative, fallback
- [ ] All choices in polite Japanese with immediate TTS playback
- [ ] Choice panel remains accessible during recording

## 5. Success Metrics

### Business Value Metrics

| Metric                           | Target    | Measurement Method                                |
| -------------------------------- | --------- | ------------------------------------------------- |
| Core Interaction Completion Rate | ≥ 85%     | Session analysis of completed soundpad/live flows |
| User Session Duration            | ≥ 2.5 min | Analytics tracking                                |
| LLM Cost per Session             | ≤ $0.03   | Gemini API monitoring                             |
| Cultural Appropriateness Score   | ≥ 4.2/5   | User feedback surveys                             |

### Technical Health Metrics

| Metric                | Target  |
| --------------------- | ------- |
| Soundpad Load Time    | ≤ 800ms |
| Live Mode Latency     | ≤ 2.5s  |
| TTS Playback Success  | ≥ 98%   |
| PWA Installation Rate | ≥ 35%   |

## 6. Key Risks & Mitigation

| Risk                                             | Impact   | Mitigation Strategy                                                                                            |
| ------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------- |
| LLM generates culturally inappropriate responses | Critical | 1. Strict JSON output enforcement<br>2. Japanese language validation layer<br>3. User feedback mechanism       |
| High LLM costs during scaling                    | High     | 1. Aggressive caching strategy<br>2. Circuit breaker for budget control<br>3. Small model for reply generation |
| STT accuracy issues in noisy environments        | Medium   | 1. Clear user instructions<br>2. Transcript editing capability<br>3. Contextual phrase fallbacks               |
| Cultural missteps in phrase content              | Critical | 1. Native speaker validation<br>2. Japan-specific phrase database<br>3. User reporting mechanism               |

## 7. Dependencies

### External

- Google Gemini API (stable access)
- Browser speech synthesis API (universal support)
- NextAuth Google provider availability

### Internal

- Drizzle ORM schema completion ([`src/server/db/schema/`](src/server/db/schema/:1))
- LLM prompt engineering ([`src/server/api/services/llmService/prompts.ts`](src/server/api/services/llmService/prompts.ts:1))
- Mobile-first UI component library ([`src/components/`](src/components/:1))

## 8. MVP Roadmap

### Phase 1: Foundation (Weeks 1-2)

- [ ] Implement authentication flow with email whitelist
- [ ] Build static soundpad UI with hardcoded phrases
- [ ] Create profile management system

### Phase 2: Core Value (Weeks 3-4)

- [ ] Integrate Soundpad Generator with Prompt 1
- [ ] Implement Live Conversation UI basic flow
- [ ] Add conversation history storage

### Phase 3: Polish (Weeks 5-6)

- [ ] Implement LLM caching strategy
- [ ] Add accessibility enhancements
- [ ] Complete PWA installation flow
- [ ] Implement admin debug tools

## 9. Quality Gates

### Before Release

- [ ] All user stories meet acceptance criteria
- [ ] Core flows tested with Japanese native speakers
- [ ] LLM costs validated against budget constraints
- [ ] PWA meets Lighthouse accessibility ≥ 90

### Ongoing

- Monitor cultural appropriateness through user feedback
- Track phrase usage patterns to refine scenario sets
- Validate cost-per-session remains within target

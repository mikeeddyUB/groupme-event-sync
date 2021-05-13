import axios from 'axios'
import * as fs from 'fs'
import { calendar_v3 } from 'googleapis'
import * as moment from 'moment'
import { BASE_GROUPME_URL, GROUPME_TOKEN_PATH } from './constants'

const token = fs
  .readFileSync(GROUPME_TOKEN_PATH)
  .toString()
  .replace(/\r?\n|\r/g, '')

export type Role = 'admin' | 'owner'
export type DeletionMode = 'sender' | 'creator'
export interface Member {
  user_id: string
  name: string
  nickname: string
  image_url: string
  id: string
  muted: boolean
  autokicked: boolean
  roles: Role[]
}

export interface Attachment {
  event_id: string
  view: 'full'
  type: 'event'
}

export interface EventBrief {
  id: string
  name: string
}

export interface Location {
  lat: number
  lng: number
  name: string
  address: string
}

export interface EventDetailed {
  name: string
  description: string
  location: Location
  start_at: string
  end_at: string
  is_all_day: boolean
  timezone: string
  reminders: any[]
  conversation_id: string
  event_id: string
  creator_id: string
  going: string[]
  not_going: string[]
  created_at: string
  updated_at: string
  deleted_at: string
}

export interface User {
  id: string
  nickname: string
}
export interface EventData {
  event: EventBrief
  url: string
  user: User
}

export interface Event {
  type: 'calendar.event.created'
  data: EventData
}

export interface Message {
  attachments: Attachment[]
  avatar_url: string | null
  created_at: number
  favorited_by: any[] // not sure
  group_id: string
  id: string
  name: string
  sender_id: string
  sender_type: string
  source_guid: string
  system: boolean
  text: string
  user_id: string
  platform: string // 'gm'?
  event: Event
}

export interface MessagePreview {
  nickname: string
  text: string
  image_url: string
  attachments: Attachment[]
}
export interface MessageBrief {
  count: number
  last_message_id: string
  last_message_created_at: number
  preview: MessagePreview
}

export interface Group {
  id: string // id and group id appear to be the same
  group_id: string
  name: string
  phone_number: string
  type: 'private' | 'public' // assuming public
  description: string
  image_url: string | null
  creator_user_id: string
  created_at: number // 1620743540
  updated_at: number
  muted_until: number | null
  office_mode: boolean
  share_url: string
  share_qr_code_url: string
  members: Member[]
  messages: MessageBrief[]
  max_members: number
  theme_name: string | null
  like_icon: string | null
  requires_approval: boolean
  show_join_question: boolean
  join_question: null
  message_deletion_period: number
  message_deletion_mode: DeletionMode[]
}

export const get = async <T>(url: string, params = {}): Promise<T> => {
  const response = await axios.get<T>(BASE_GROUPME_URL + url, { params: { token, ...params } })
  return (response.data as any).response
}

export const post = async <T>(url: string, payload: Record<string, any>): Promise<T> => {
  const response = await axios.post<T>(BASE_GROUPME_URL + url, payload, {
    params: {
      token
    }
  })
  return (response.data as any).response
}

export const getGroups = async (): Promise<Group[]> => get<Group[]>('groups')

const colorMap: Record<string, string> = {
  blk: 'black',
  char: 'charcoal',
  gry: 'grey',
  crl: 'coral',
  purp: 'purple',
  pink: 'pink',
  'lt gry': 'light grey'
}

const hasColors = (name: string): boolean => Object.keys(colorMap).some((abrvColor) => name.includes(`(${abrvColor})`))

const extractName = (name: string, calName: string, teamName: string): string => {
  // Ace (Teal) vs. Tracy's #1 Fans! (blk) (Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21)
  // Notorious D.I.G. 2.0 vs. Setsy and we know it (Beach Volleyball - Coed 4v4 - Thurs - Spring 2 '21)
  //
  let newName = name.split(`(${calName})`)[0].trim()
  if (!hasColors(newName)) {
    console.log(`extracted name: [${newName}]`)
    return newName
  }
  // remove from 'Ace (Teal) vs. Tracy's #1 Fans! (blk)'
  const nameRegExp = new RegExp(`(${teamName} )([(A-Za-z .)]{0,8})`)
  newName = newName.replace(nameRegExp, '$1').replace('  ', ' ')
  // newName = newName.replace(/(Ace )([(A-Za-z)]{0,8})/, '$1').replace('  ', ' ');
  Object.entries(colorMap).forEach(([key, value]) => {
    newName = newName.replace(`(${key})`, `(${value})`)
  })
  console.log(`extracted name: [${newName}]`)
  return newName
}

const extractDescription = (location: string): string => {
  // The MAC (Beach #1)
  const [, desc] = location.match(/Beach #([0-9]{0,1})/)
  // const [, desc] = location.match(/Beach\ \#([0-9]{0,1})/);
  // console.log('new desc: ', desc);
  return `Court ${desc}`
}

export const postEvent = async (groupId: string, _event: EventDetailed): Promise<any> =>
  post(`conversations/${groupId}/events/create`, {
    location: {
      name: 'MAC Sports & Entertainment (The Mac)',
      address: '8924 Midway West Rd\nRaleigh, NC 27617 \nUnited States',
      lat: 35.90874099731445,
      lng: -78.75588989257812
    },
    is_all_day: false,
    timezone: 'America/New_York',
    reminders: [],
    going: [],
    ..._event
  })

export const getGroupByName = async (name: string): Promise<Group> => {
  const groups = await getGroups()
  const group = groups.find((g) => g.name === name)
  if (!group) {
    throw new Error(`group ${name} does not exist`)
  }
  return group
}

export const getGroupmeEvents = async (groupId: string) => {
  const { messages }: { messages: Message[] } = await get(`groups/${groupId}/messages`)
  // console.log('messages: ', JSON.stringify(messages, null, 2))
  const eventMessages = []
  for (const message of messages) {
    if (!message.event || !message.event.data.event.id) {
      continue
    }
    const event = await getEvent(groupId, message.event.data.event.id)
    // console.log('event: ', event)
    if (!event.deleted_at) {
      eventMessages.push(event)
    }
  }
  // console.log('events: ', eventMessages)
  return eventMessages
}

export const getGroupmeEventByName = async (groupId: string, eventName: string) => {
  const groupmeEvents = await getGroupmeEvents(groupId)
  // return groupmeEvents.find((e) => e.name === eventName);

  return groupmeEvents.find((e) => e.name === eventName)
}

export const getEvent = async (groupId: string, eventId: string): Promise<EventDetailed> => {
  // https://api.groupme.com/v3/conversations/68165878/events/show?event_id=ded340d7c152460f8428f49f0c9b5c29
  const { event } = await get(`conversations/${groupId}/events/show`, { event_id: eventId })
  return event
}

export const createEventFromCalendar = async (
  groupId: string,
  calendarEvent: calendar_v3.Schema$Event,
  calName: string,
  teamName: string
): Promise<any | null> => {
  // first check that the event doesnt already exist
  const name = extractName(calendarEvent.summary, calName, teamName)
  const existingEvent = await getGroupmeEventByName(groupId, name)
  if (existingEvent) {
    console.log(`event "${name}" already exists`)
    return null
  }
  const ev = {
    name,
    description: extractDescription(calendarEvent.location),
    start_at: moment(calendarEvent.start.dateTime).format(),
    // 2021-05-10T22:45:00Z to
    // 2021-05-10T12:30:00-04:00
    end_at: moment(calendarEvent.end.dateTime).format()
  } as EventDetailed

  return postEvent(groupId, ev)
}
// we also need code to cancel/update the event if it changes

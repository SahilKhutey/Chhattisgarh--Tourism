import { EmergencyDispatcher } from './emergency.dispatcher';

describe('EmergencyDispatcher', () => {
  let dispatcher: EmergencyDispatcher;

  beforeEach(() => {
    dispatcher = new EmergencyDispatcher();
  });

  it('returns a successful platform dispatch result', async () => {
    const result = await dispatcher.dispatch({
      alertId: 'sos_test',
      touristName: 'Test Tourist',
      touristPhone: '+91-9999999999',
      latitude: 21.25,
      longitude: 81.63,

      primary: {
        id: 'station-1',
        name: 'Primary',
        phone: '+91-111',
        type: 'POLICE',
        distanceKm: 1.2,
      },

      backups: [
        {
          id: 'station-2',
          name: 'Backup 1',
          phone: '+91-222',
          type: 'HOSPITAL',
          distanceKm: 2.3,
        },

        {
          id: 'station-3',
          name: 'Backup 2',
          phone: '+91-333',
          type: 'RANGER',
          distanceKm: 3.4,
        },

        {
          id: 'station-4',
          name: 'Backup 3',
          phone: '+91-444',
          type: 'POLICE',
          distanceKm: 4.5,
        },
      ],
    });

    expect(result).toEqual({
      primaryDispatched: true,
      backupsDispatched: 3,
      provider: 'PLATFORM_DISPATCH_QUEUE',
    });
  });
});

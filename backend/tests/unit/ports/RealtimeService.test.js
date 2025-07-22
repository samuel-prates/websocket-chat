
const RealtimeService = require('../../../src/application/ports/RealtimeService');

describe('RealtimeService', () => {
    it('should throw an error when emitChatMessage is called', async () => {
        const realtimeService = new RealtimeService();
        expect(() => realtimeService.emitChatMessage({})).toThrow('Method not implemented');
    });
});

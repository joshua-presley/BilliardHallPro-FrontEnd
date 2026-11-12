
export class AllBillsDeletedException extends Error { 
    constructor() { 
        super('All the bills for this session are marked as deleted. There should always be at least 1 non-deleted bill.')
    }
}
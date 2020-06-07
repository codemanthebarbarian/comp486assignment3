
class InventoryRepo extends Phaser.Plugins.BasePlugin {

    constructor(pluginManager) {
        super(pluginManager);
        let json = localStorage.getItem('inventory');
        if(json) this.inv = JSON.parse(json);
        else this.inv = { cash: 50.00, tickets: null, items: [] };
        localStorage.setItem('inventory', JSON.stringify(this.inv));
    }

    cash() {
        return this.inv.cash;
    }

    getCash(amt) {
        if(amt > this.inv.cash) return 0;
        this.inv.cash -= amt;
        return amt;
    }

    addCash(amt) {
        this.inv.cash += amt;
    }

    tickets() {
        return this.inv.tickets;
    }

    addTickets(amt) {
        this.inv.tickets += amt;
    }

    getTickets(amt) {
        if(amt > this.inv.tickets) return 0;
        this.inv.tickets -= amt;
        return amt;
    }

    owns(itm) {
        return this.inv.items.find(i => i === itm) === true;
    }

    getItem(itm) {
        let i = this.inv.items.findIndex(e => e === itm);
        if(i < 0) return null;
        let result = this.inv.items[i];
        this.inv.items.splice(i, 1);
        return result;
    }

    addItem(itm) {
        if(itm.constructor === Array) this.inv.items = this.inv.items.concat(itm);
        else this.inv.items.push(itm);
    }

    save() {
        localStorage.setItem('inventory', JSON.stringify(this.inv));
    }

}
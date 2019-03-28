const { BN, constants, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const OWNERLESS_ADDRESS = '0x0000000000000000000000000000000000000001';

function shouldBehaveLikeERC777DirectSend (holder, recipient, data) {
  describe('direct send', function () {
    context('when the sender has tokens', function () {
      shouldDirectSendTokens(holder, recipient, new BN('0'), data);
      shouldDirectSendTokens(holder, recipient, new BN('1'), data);

      it('reverts when sending more than the balance', async function () {
        const balance = await this.token.balanceOf(holder);
        await shouldFail.reverting(this.token.send(recipient, balance.addn(1), data, { from: holder }));
      });

      it('reverts when sending to the zero address', async function () {
        await shouldFail.reverting(this.token.send(ZERO_ADDRESS, new BN('1'), data, { from: holder }));
      });
    });

    context('when the sender has no tokens', function () {
      removeBalance(holder);

      shouldDirectSendTokens(holder, recipient, new BN('0'), data);

      it('reverts when sending a non-zero amount', async function () {
        await shouldFail.reverting(this.token.send(recipient, new BN('1'), data, { from: holder }));
      });
    });
  });
}

function shouldBehaveLikeERC777OperatorSend (holder, recipient, operator, data, operatorData) {
  describe('operator send', function () {
    context('when the sender has tokens', async function () {
      shouldOperatorSendTokens(holder, operator, recipient, new BN('0'), data, operatorData);
      shouldOperatorSendTokens(holder, operator, recipient, new BN('1'), data, operatorData);

      it('reverts when sending more than the balance', async function () {
        const balance = await this.token.balanceOf(holder);
        await shouldFail.reverting(
          this.token.operatorSend(holder, recipient, balance.addn(1), data, operatorData, { from: operator })
        );
      });

      it('reverts when sending to the zero address', async function () {
        await shouldFail.reverting(
          this.token.operatorSend(
            holder, ZERO_ADDRESS, new BN('1'), data, operatorData, { from: operator }
          )
        );
      });
    });

    context('when the sender has no tokens', function () {
      removeBalance(holder);

      shouldOperatorSendTokens(holder, operator, recipient, new BN('0'), data, operatorData);

      it('reverts when sending a non-zero amount', async function () {
        await shouldFail.reverting(
          this.token.operatorSend(holder, recipient, new BN('1'), data, operatorData, { from: operator })
        );
      });
    });
  });
}

function shouldBehaveLikeERC777DirectBurn (holder, data) {
  describe('direct burn', function () {
    context('when the sender has tokens', function () {
      shouldDirectBurnTokens(holder, new BN('0'), data);
      shouldDirectBurnTokens(holder, new BN('1'), data);

      it('reverts when burning more than the balance', async function () {
        const balance = await this.token.balanceOf(holder);
        await shouldFail.reverting(this.token.burn(balance.addn(1), data, { from: holder }));
      });
    });

    context('when the sender has no tokens', function () {
      removeBalance(holder);

      shouldDirectBurnTokens(holder, new BN('0'), data);

      it('reverts when burning a non-zero amount', async function () {
        await shouldFail.reverting(this.token.burn(new BN('1'), data, { from: holder }));
      });
    });
  });
}

function shouldBehaveLikeERC777OperatorBurn (holder, operator, data, operatorData) {
  describe('operator burn', function () {
    context('when the sender has tokens', async function () {
      shouldOperatorBurnTokens(holder, operator, new BN('0'), data, operatorData);
      shouldOperatorBurnTokens(holder, operator, new BN('1'), data, operatorData);

      it('reverts when burning more than the balance', async function () {
        const balance = await this.token.balanceOf(holder);
        await shouldFail.reverting(
          this.token.operatorBurn(holder, balance.addn(1), data, operatorData, { from: operator })
        );
      });
    });

    context('when the sender has no tokens', function () {
      removeBalance(holder);

      shouldOperatorBurnTokens(holder, operator, new BN('0'), data, operatorData);

      it('reverts when burning a non-zero amount', async function () {
        await shouldFail.reverting(
          this.token.operatorBurn(holder, new BN('1'), data, operatorData, { from: operator })
        );
      });
    });
  });
}

function shouldDirectSendTokens (from, to, amount, data) {
  shouldSendTokens(from, null, to, amount, data, null);
}

function shouldOperatorSendTokens (from, operator, to, amount, data, operatorData) {
  shouldSendTokens(from, operator, to, amount, data, operatorData);
}

function shouldSendTokens (from, operator, to, amount, data, operatorData) {
  const operatorCall = operator !== null;

  it(`${operatorCall ? 'operator ' : ''}can send an amount of ${amount}`, async function () {
    const initialTotalSupply = await this.token.totalSupply();
    const initialFromBalance = await this.token.balanceOf(from);
    const initialToBalance = await this.token.balanceOf(to);

    if (!operatorCall) {
      const { logs } = await this.token.send(to, amount, data, { from });
      expectEvent.inLogs(logs, 'Sent', {
        operator: from,
        from,
        to,
        amount,
        data,
        operatorData: null,
      });
    } else {
      const { logs } = await this.token.operatorSend(from, to, amount, data, operatorData, { from: operator });
      expectEvent.inLogs(logs, 'Sent', {
        operator,
        from,
        to,
        amount,
        data,
        operatorData,
      });
    }

    const finalTotalSupply = await this.token.totalSupply();
    const finalFromBalance = await this.token.balanceOf(from);
    const finalToBalance = await this.token.balanceOf(to);

    finalTotalSupply.should.be.bignumber.equal(initialTotalSupply);
    finalToBalance.sub(initialToBalance).should.be.bignumber.equal(amount);
    finalFromBalance.sub(initialFromBalance).should.be.bignumber.equal(amount.neg());
  });
}

function shouldDirectBurnTokens (from, amount, data) {
  shouldBurnTokens(from, null, amount, data, null);
}

function shouldOperatorBurnTokens (from, operator, amount, data, operatorData) {
  shouldBurnTokens(from, operator, amount, data, operatorData);
}

function shouldBurnTokens (from, operator, amount, data, operatorData) {
  const operatorCall = operator !== null;

  it(`${operatorCall ? 'operator ' : ''}can burn an amount of ${amount}`, async function () {
    const initialTotalSupply = await this.token.totalSupply();
    const initialFromBalance = await this.token.balanceOf(from);

    if (!operatorCall) {
      const { logs } = await this.token.burn(amount, data, { from });
      expectEvent.inLogs(logs, 'Burned', {
        operator: from,
        from,
        amount,
        data,
        operatorData: null,
      });
    } else {
      const { logs } = await this.token.operatorBurn(from, amount, data, operatorData, { from: operator });
      expectEvent.inLogs(logs, 'Burned', {
        operator,
        from,
        amount,
        data,
        operatorData,
      });
    }

    const finalTotalSupply = await this.token.totalSupply();
    const finalFromBalance = await this.token.balanceOf(from);

    finalTotalSupply.sub(initialTotalSupply).should.be.bignumber.equal(amount.neg());
    finalFromBalance.sub(initialFromBalance).should.be.bignumber.equal(amount.neg());
  });
}

function removeBalance (holder) {
  beforeEach(async function () {
    await this.token.send(OWNERLESS_ADDRESS, await this.token.balanceOf(holder), '0x', { from: holder });
    (await this.token.balanceOf(holder)).should.be.bignumber.equal('0');
  });
}

module.exports = {
  shouldBehaveLikeERC777DirectSend,
  shouldBehaveLikeERC777OperatorSend,
  shouldBehaveLikeERC777DirectBurn,
  shouldBehaveLikeERC777OperatorBurn,
  shouldDirectSendTokens,
};

import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import InfoBox from '../InfoBox';
import { requestProvider } from 'webln';
import { Slider, Switch, InputNumber, Form, Button } from 'antd';
import axios from 'axios';

import './Game.css';

export default function Game() {
  const [amount, setAmount] = useState(0);
  const [slide, setSlide] = useState(50);
  const [isUnder, setUnder] = useState(true);
  const [webln, setWebln] = useState();
  const [randomString, setRandomString] = useState('');
  const [nonce, setNonce] = useState(0);
  const [serverSeed, setServerSeed] = useState('');
  const [luckyNumber, setLuckyNumber] = useState('');
  var invoice;

  useEffect(() => {
    async function getProvider() {
      try {
        const ln = await requestProvider();
        setWebln(ln);

        createRandomString(30);
        // Now you can call all of the webln.* methods
      } catch (err) {
        // Tell the user what went wrong
        alert(err.message);
      }
    }

    async function getServerSeed() {
      axios.get('http://localhost:4000/getServerSeed').then(res => {
        setServerSeed(res.data.serverSeed);
      });
    }

    getProvider();
    getServerSeed();
  }, []);

  function createRandomString(length) {
    const availableChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += availableChars[Math.floor(Math.random() * availableChars.length)];
    }
    setRandomString(randomString);
  }

  function onChangeSlide(checked) {
    setUnder(checked);
  }

  function onChangeInput(value) {
    setAmount(value);
  }

  function getLuckyNumber() {
    axios
      .post(' http://localhost:4000/luckyNumber', {
        serverSeed: serverSeed,
        clientSeed: randomString,
        nonce: nonce
      })
      .then(async res => {
        setLuckyNumber(res.data.luckyNumber);
        if (isUnder) {
          if (res.data.luckyNumber < slide) {
            invoice = await webln.makeInvoice({
              amount: amount * (95 / (95 - slide)).toFixed(2),
              defaultMemo: 'you win'
            });
            createInvoice(invoice.paymentRequest);
          } else {
            console.log('lose');
          }
        } else {
          if (res.data.luckyNumber > slide) {
            invoice = await webln.makeInvoice({
              amount: amount * (95 / slide).toFixed(2),
              defaultMemo: 'you win'
            });
            createInvoice(invoice.paymentRequest);
          } else {
            console.log('lose');
          }
        }
      });
  }

  function createInvoice(payment_request) {
    axios
      .post('http://localhost:4000/sendPayment', {
        payment_request
      })
      .then(res => {
        console.log(res);
      });
  }

  function addInvoice() {
    axios
      .post(' http://localhost:4000/addInvoice', {
        amt_paid: amount
      })
      .then(async res => {
        console.log(res.data.payment_request);

        await webln.sendPayment(res.data.payment_request);
        getLuckyNumber();
        setNonce(nonce + 1);
      });
  }

  return (
    <div className='width-container box'>
      <Form>
        <Form.Item>
          <Row>
            <Col span={8}>
              <InfoBox name='Your Bet' amount={amount} />
            </Col>
            <Col span={8} offset={8}>
              <InfoBox name='Lucky Number' luckyNumber={luckyNumber} />
            </Col>
          </Row>
        </Form.Item>
        <Form.Item>
          <Row>
            <Col span={12} offset={6}>
              <Slider
                defaultValue={slide}
                min={1}
                max={95}
                onChange={value => setSlide(value)}
                tooltipVisible
              />
            </Col>
          </Row>
        </Form.Item>
        <Form.Item>
          <Row>
            <Col span={4} offset={6}>
              Under
            </Col>
            <Col span={4}>
              <Switch checked={isUnder} onChange={onChangeSlide} />
            </Col>
            <Col span={4}>Over</Col>
          </Row>
        </Form.Item>
        <Form.Item>
          <Row>
            <Col span={12}>
              <span>Win Chance : {slide}%</span>
            </Col>
            <Col span={12}>
              {isUnder ? (
                <span>Multiplier : {(95 / (95 - slide)).toFixed(2)}</span>
              ) : (
                <span>Multiplier : {(95 / slide).toFixed(2)}</span>
              )}
            </Col>
          </Row>
        </Form.Item>
        <Form.Item>
          <Row>
            <Col span={12}>
              <Col span={12}>
                <span>Bet Amount</span>
              </Col>
              <Col>
                <InputNumber min={0} defaultValue={1} onChange={onChangeInput} />
              </Col>
            </Col>
            <Col span={12}>
              <Col span={12}>
                <span>Payout on WIN</span>
              </Col>
              {isUnder ? (
                <InputNumber min={0} value={amount * (95 / (95 - slide)).toFixed(2)} disabled />
              ) : (
                <InputNumber min={0} value={amount * (95 / slide).toFixed(2)} disabled />
              )}
            </Col>
          </Row>
        </Form.Item>
        <Form.Item>
          <Button type='primary' onClick={addInvoice}>
            Bet
          </Button>
        </Form.Item>
        <Form.Item>
          <div>
            <strong>Server Hash</strong>
          </div>
          <div className='selector'>{serverSeed}</div>

          <div>
            <strong>User Seed</strong>
          </div>
          <div>{randomString}</div>

          <div>
            <strong>Nonce</strong> : {nonce}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

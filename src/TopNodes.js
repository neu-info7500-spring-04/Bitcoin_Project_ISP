import React, { useState, useEffect } from 'react';
import './styles.css';

function TopNodesTable() {
    const [top100Nodes, setTop100Nodes] = useState([]);
    const [bitcoinValue, setBitcoinValue] = useState(null);
    const [totalCapacity, setTotalCapacity] = useState(0);
    const [totalChannels, setTotalChannels] = useState(0);
    const [asnId, setAsnId] = useState('16509'); // State to hold the ASN ID

    // Fetch data for top 100 nodes based on ASN ID
    const fetchData = async () => {
        try {
            const response = await fetch(`https://mempool.space/api/v1/lightning/nodes/isp/${asnId}`);
            const data = await response.json();
            setTop100Nodes(data.nodes);
            console.log(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [asnId]); // Refetch data when ASN ID changes

    // Fetch Bitcoin value
    useEffect(() => {
        const fetchBitcoinValue = async () => {
            try {
                const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
                const data = await response.json();
                setBitcoinValue(data.bpi.USD.rate_float);
            } catch (error) {
                console.error('Error fetching Bitcoin value:', error);
            }
        };
        
        fetchBitcoinValue();
    }, []);

    // Calculate total capacity and total channels when top100Nodes or bitcoinValue changes
    useEffect(() => {
        const calculateTotalMetrics = () => {
            const totalCapacity = top100Nodes.reduce((acc, node) => acc + node.capacity, 0);
            setTotalCapacity(totalCapacity);

            const totalChannels = top100Nodes.reduce((acc, node) => acc + node.channels, 0);
            setTotalChannels(totalChannels);
        };

        calculateTotalMetrics();
    }, [top100Nodes, bitcoinValue]);

    const roundToTwoDecimalPlaces = (number) => {
        return (number / 100000000).toFixed(2);
    };

    const USDConversion = (liquidity) => {
        return Math.floor((liquidity / 100000000) * bitcoinValue);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000); // Convert to milliseconds
        return date.toLocaleString();
    };

    const renderCountry = (country) => {
        return country ? country.en : 'Unknown';
    };

    return (
        <div>
            <h1>List of Nodes hosted by specified ISP</h1>
            {/* Input field for user to enter ASN ID */}
            <label>
                Enter ASN ID:
                <input type="text" value={asnId} onChange={(e) => setAsnId(e.target.value)} />
            </label>

            {/* New table */}
            <table border="1">
                <tbody>
                    <tr>
                        <td>ASN</td>
                        <td>{asnId}</td>
                    </tr>
                    <tr>
                        <td>Active Nodes</td>
                        <td>{top100Nodes.length}</td>
                    </tr>
                    <tr>
                        <td>Liquidity</td>
                        <td>{roundToTwoDecimalPlaces(totalCapacity)}</td>
                    </tr>
                    <tr>
                        <td>Channels</td>
                        <td>{totalChannels}</td>
                    </tr>
                </tbody>
            </table>
            <table border="1">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Alias</th>
                        <th>Capacity</th>
                        <th>Channels</th>
                        <th>First Seen</th>
                        <th>Last Update</th>
                        <th>Location</th>
                    </tr>
                </thead>
                <tbody>
                    {top100Nodes.map((node, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{node.alias}</td>
                            <td>{roundToTwoDecimalPlaces(node.capacity)}</td>
                            <td>{node.channels}</td>
                            <td>{formatDate(node.first_seen)}</td>
                            <td>{formatDate(node.updated_at)}</td>
                            <td>{renderCountry(node.country)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TopNodesTable;

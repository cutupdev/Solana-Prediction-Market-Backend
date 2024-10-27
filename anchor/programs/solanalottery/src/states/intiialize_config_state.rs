use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Default, Debug)]
pub struct LotteryConfig {
    pub lottery_id: u64,
    pub bump: u8,
    pub winner: u64,
    pub winner_chosen: bool,
    pub lottery_start: u64,
    pub lottery_end: u64,
    pub lottery_pot_amount: u64,
    pub ticket_num: u64,
    pub price: u64,
    pub randomness_account: Pubkey,
    pub authority: Pubkey,
}
